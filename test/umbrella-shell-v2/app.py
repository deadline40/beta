import os
import sqlite3
from flask import Flask, request, jsonify, send_from_directory, session
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = 'UMBRELLA_CORP_TOP_SECRET_KEY' # In production, use os.urandom(24)

DB_FILE = 'umbrella.db'

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # Table articles
    c.execute('''
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author TEXT NOT NULL,
            clearance TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Table users
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    
    # Create default admin user if no users exist
    c.execute('SELECT COUNT(*) FROM users')
    if c.fetchone()[0] == 0:
        default_hash = generate_password_hash('admin')
        c.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)', ('admin', default_hash))
        print("System: Default 'admin' account created.")

    conn.commit()
    conn.close()

# --- AUTHENTICATION ROUTES ---

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Missing credentials"}), 400
        
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = c.fetchone()
    conn.close()
    
    if user and check_password_hash(user['password_hash'], password):
        session['user_id'] = user['id']
        session['username'] = user['username']
        return jsonify({"message": "Access granted"}), 200
        
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/me', methods=['GET'])
def me():
    if 'user_id' in session:
        return jsonify({"username": session['username']}), 200
    return jsonify({"error": "Unauthorized"}), 401


# --- ARTICLES ROUTES ---

@app.route('/api/articles', methods=['GET'])
def get_articles():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM articles ORDER BY id DESC')
    articles = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(articles)

@app.route('/api/articles/<int:article_id>', methods=['GET'])
def get_article(article_id):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM articles WHERE id = ?', (article_id,))
    article = c.fetchone()
    conn.close()
    if article:
        return jsonify(dict(article))
    return jsonify({"error": "Article not found"}), 404

@app.route('/api/articles', methods=['POST'])
def create_article():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized. Admin login required."}), 401
        
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    author = data.get('author')
    clearance = data.get('clearance', 'LEVEL 1')
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if not title or not content or not author:
        return jsonify({"error": "Missing required fields"}), 400

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        INSERT INTO articles (title, content, author, clearance, created_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (title, content, author, clearance, created_at))
    conn.commit()
    article_id = c.lastrowid
    conn.close()

    return jsonify({"id": article_id, "message": "Article created successfully"}), 201

@app.route('/api/articles/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized. Admin login required."}), 401
        
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('DELETE FROM articles WHERE id = ?', (article_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Article deleted successfully"}), 200

# Route par défaut pour servir l'OS
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    init_db()
    # Le serveur Flask tournera sur http://localhost:5000
    app.run(host='0.0.0.0', port=5000, debug=True)
