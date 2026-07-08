// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('article-form');
    const statusMsg = document.getElementById('form-status');
    const articlesList = document.getElementById('articles-list');
    
    const loginOverlay = document.getElementById('login-overlay');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form');
    const loginStatus = document.getElementById('login-status');
    const logoutBtn = document.getElementById('logout-btn');
    const currentUserSpan = document.getElementById('current-user');

    // -----------------------------------------------------
    // AUTHENTICATION LOGIC
    // -----------------------------------------------------
    
    const checkAuth = async () => {
        try {
            const res = await fetch('/api/me');
            if (res.ok) {
                const data = await res.json();
                currentUserSpan.textContent = `USER: ${data.username.toUpperCase()}`;
                loginOverlay.style.display = 'none';
                adminDashboard.style.display = 'block';
                fetchArticles(); // Load data once authorized
            } else {
                loginOverlay.style.display = 'flex';
                adminDashboard.style.display = 'none';
            }
        } catch (error) {
            console.error('Erreur vérification session:', error);
            loginStatus.textContent = 'ERREUR DE CONNEXION AU SERVEUR';
            loginStatus.className = 'status-msg error';
        }
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginStatus.textContent = 'AUTHENTIFICATION...';
        loginStatus.className = 'status-msg';

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                loginStatus.textContent = 'ACCÈS AUTORISÉ';
                loginStatus.className = 'status-msg success';
                setTimeout(() => {
                    checkAuth();
                }, 500);
            } else {
                loginStatus.textContent = 'ACCÈS REFUSÉ : IDENTIFIANTS INVALIDES';
                loginStatus.className = 'status-msg error';
            }
        } catch (error) {
            console.error('Erreur login:', error);
            loginStatus.textContent = 'ERREUR DE CONNEXION AU SERVEUR';
            loginStatus.className = 'status-msg error';
        }
    });

    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/logout', { method: 'POST' });
            document.getElementById('login-username').value = '';
            document.getElementById('login-password').value = '';
            loginStatus.textContent = '';
            checkAuth();
        } catch (error) {
            console.error('Erreur déconnexion:', error);
        }
    });

    // -----------------------------------------------------
    // DATA MANAGEMENT LOGIC
    // -----------------------------------------------------

    // Fetch and display articles
    const fetchArticles = async () => {
        try {
            const res = await fetch('/api/articles');
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            
            articlesList.innerHTML = '';
            
            if (data.length === 0) {
                articlesList.innerHTML = '<div style="color:#888; font-size:0.8rem;">Aucune archive trouvée.</div>';
                return;
            }

            data.forEach(article => {
                const item = document.createElement('div');
                item.className = 'article-item';
                item.innerHTML = `
                    <div class="article-info">
                        <div class="article-title">${article.title}</div>
                        <div class="article-meta">
                            AUTEUR: <span>${article.author}</span> | ACCRÉDITATION: <span>${article.clearance}</span> | DATE: ${article.created_at}
                        </div>
                    </div>
                    <button class="delete-btn" onclick="deleteArticle(${article.id})">SUPPRIMER</button>
                `;
                articlesList.appendChild(item);
            });
        } catch (error) {
            console.error('Erreur lors du chargement des articles:', error);
            articlesList.innerHTML = '<div style="color:red; font-size:0.8rem;">Erreur de connexion au serveur.</div>';
        }
    };

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusMsg.textContent = 'PUBLICATION EN COURS...';
        statusMsg.className = 'status-msg';

        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const clearance = document.getElementById('clearance').value;
        const content = document.getElementById('content').value;

        try {
            const res = await fetch('/api/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, author, clearance })
            });

            if (res.ok) {
                statusMsg.textContent = 'RAPPORT PUBLIÉ AVEC SUCCÈS.';
                statusMsg.className = 'status-msg success';
                form.reset();
                fetchArticles(); // Refresh list
            } else {
                const errData = await res.json();
                throw new Error(errData.error || 'Erreur serveur');
            }
        } catch (error) {
            console.error('Erreur lors de la publication:', error);
            statusMsg.textContent = 'ERREUR : ' + error.message;
            statusMsg.className = 'status-msg error';
        }

        setTimeout(() => { statusMsg.textContent = ''; }, 4000);
    });

    // Delete article function (global scope so it can be called from onclick)
    window.deleteArticle = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir purger ce document des archives ?')) return;
        
        try {
            const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchArticles();
            } else {
                const errData = await res.json();
                alert('Erreur: ' + (errData.error || 'Impossible de supprimer'));
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    // Initial load: check auth instead of directly fetching articles
    checkAuth();
});
