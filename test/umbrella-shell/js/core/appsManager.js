// js/core/appsManager.js

const UmbrellaApps = {
    
    // ==========================================
    // 1. STOCKAGE DES DONNÉES (FAUSSE BDD)
    // ==========================================
    data: {
        personnel: [
            { id: "EMP-0941", name: "Dandrien Ihonty", role: "Chief System Administrator / Web Developer", status: "ACTIVE", clearance: "LEVEL 3", ip: "10.240.0.12", sent: 124 },
            { id: "EMP-1022", name: "Dr. Albert W.", role: "Director of Bio-Research", status: "UNVERIFIED", clearance: "LEVEL 5", ip: "10.240.7.99", sent: 8 },
            { id: "EMP-4042", name: "Annette B.", role: "Junior IT Technician", status: "ACTIVE", clearance: "LEVEL 1", ip: "10.240.2.41", sent: 45 }
        ],
        security: [
            { date: "13:41:02", loc: "SECTOR 7", log: "Minor containment breach in Lab B. Automated lockdown engaged and cleared.", type: "CRITICAL" },
            { date: "13:30:15", loc: "SERVER ROOM", log: "Mainframe upgrade compiled successfully by Lead Web Dev.", type: "INFO" },
            { date: "12:12:44", loc: "MAIN GATE", log: "Unidentified satellite tracking signal detected. Firewall updated.", type: "WARNING" }
        ],
        database: [
            { project: "T-VIRUS", status: "STABLE", load: 94, temp: 4.2, location: "Underground Vault", threat: "HIGH" },
            { project: "NE-ALPHA", status: "IN CUSTODY", load: 42, temp: -18.5, location: "Holding Cell 3", threat: "CRITICAL" },
            { project: "REPLIT-AGENTS", status: "COMPILING", load: 68, temp: 21.0, location: "Cybernetics Division", threat: "LOW" }
        ]
    },

    // ==========================================
    // 2. INITIALISATION ET MOTEURS D'ANIMATION
    // ==========================================
    init() {
        this.zIndexCounter = 1000; // Sert à mettre la fenêtre cliquée au-dessus des autres
        this.registerAppCommands();
        this.startGlobalLoops();
        this.startBottomAnimations(); 
    },

    // Boucles d'arrière-plan (Temps réel)
    startGlobalLoops() {
        // Boucle A : Fait bouger les pings, les Mo envoyés et les températures toutes les 1.5s
        setInterval(() => {
            this.data.personnel.forEach(p => { if (p.status === "ACTIVE") p.sent += Math.floor(Math.random() * 15); });
            this.data.database.forEach(d => {
                d.temp += (Math.random() - 0.5) * 0.4;
                d.load += Math.floor((Math.random() - 0.5) * 4);
                if (d.load > 100) d.load = 100; if (d.load < 10) d.load = 10;
            });
            this.updatePersonnelUI();
            this.updateDatabaseUI();
        }, 1500);

        // Boucle B : Génère un faux incident de sécurité toutes les 8 secondes
        setInterval(() => {
            const zones = ["SERVER ROOM", "LAB-SECTOR_7", "CORRIDOR_W", "MAIN_GATE", "CYBER_DIV"];
            const logsPool = [
                { log: "Routine firewall integrity scan completed. 0 threats.", type: "INFO" },
                { log: "Technician terminal session initiated remotely.", type: "INFO" },
                { log: "Minor power fluctuation detected in cooling grids.", type: "WARNING" },
                { log: "Database query optimization executed on Replit Core.", type: "INFO" }
            ];
            const randomLog = logsPool[Math.floor(Math.random() * logsPool.length)];
            const randomZone = zones[Math.floor(Math.random() * zones.length)];
            const now = new Date().toTimeString().split(' ')[0];

            this.data.security.unshift({ date: now, loc: randomZone, log: randomLog.log, type: randomLog.type });
            if (this.data.security.length > 6) this.data.security.pop();
            this.updateSecurityUI();
        }, 8000);
    },

    // Gestion des 3 consoles d'animation tout en bas
    startBottomAnimations() {
        // Console 1 : Défilement de code infini
        const infiniteContainer = document.getElementById('stream-infinite-code');
        if (infiniteContainer) {
            setInterval(() => {
                const logs = [
                    `HEX_${Math.random().toString(16).substr(2, 5).toUpperCase()} >> PING OK`,
                    `SYNC_BLOCK_${Math.floor(Math.random()*8000)} ... SUCCESS`,
                    `01001101 01000001 01000100 010240`,
                    `LOAD_AVERAGE: ${(Math.random() * 2).toFixed(2)} / mem_alloc`,
                    `OVERFLOW_PROTECT: STABLE // active_state`,
                ];
                infiniteContainer.innerHTML += logs[Math.floor(Math.random() * logs.length)] + "<br>";
                if (infiniteContainer.innerHTML.split("<br>").length > 11) {
                    infiniteContainer.innerHTML = infiniteContainer.innerHTML.split("<br>").slice(1).join("<br>");
                }
            }, 400);
        }

        // Console 2 : Écriture automatique d'un script lettre par lettre
        const autoWriterContainer = document.getElementById('stream-auto-writer');
        const codeToType = `function initMainframe() {\n  const target = "10.240.0.12";\n  let secure = true;\n  if (secure) {\n    connect(target);\n    loadModules(["T-Virus", "ReplitAgent"]);\n    console.log("System Armored");\n  }\n}`;
        let charIndex = 0;
        
        if (autoWriterContainer) {
            setInterval(() => {
                if (charIndex < codeToType.length) {
                    autoWriterContainer.innerHTML += codeToType.charAt(charIndex) === '\n' ? '<br>' : codeToType.charAt(charIndex);
                    charIndex++;
                } else {
                    setTimeout(() => { autoWriterContainer.innerHTML = ""; charIndex = 0; }, 2000);
                }
            }, 60);
        }

        // Console 3 : Message initial de l'activité opérateur
        this.logUserActivity("Mainframe terminal initialization successfully loaded.");
    },

    // Outil pour écrire dans la console d'activité opérateur (Console 3)
    logUserActivity(actionText) {
        const userLogContainer = document.getElementById('stream-user-activity');
        if (!userLogContainer) return;
        const now = new Date().toTimeString().split(' ')[0];
        userLogContainer.innerHTML += `[${now}] ${actionText}<br>`;
        if (userLogContainer.innerHTML.split("<br>").length > 10) {
            userLogContainer.innerHTML = userLogContainer.innerHTML.split("<br>").slice(1).join("<br>");
        }
    },


    // ==========================================
    // 3. GESTION DU CLIC SUR LES BOUTONS (RENDU)
    // ==========================================
    triggerApp(appName) {
        this.currentApp = appName;
        this.logUserActivity(`Command executed: open_${appName}_app`);

        // A. Clic sur Registre du Personnel
        if (appName === 'personnel') {
            let html = `<div style="margin-bottom:12px; font-size:11px; color:#ff3333; font-weight:bold; letter-spacing:1px;">[TRAFIC ET COMM_ LINK EN DIRECT]</div><div id="dynamic-personnel-table"></div>`;
            this.openWindow('Personnel Registry', html, 520, 260); this.updatePersonnelUI();
        } 
        // B. Clic sur Logs de Sécurité
        else if (appName === 'security') {
            let html = `<div style="margin-bottom:10px; color:#ff3333; font-weight:bold; font-size:11px;">● FLUX MONITEUR D'ÉVÉNEMENTS :</div><div id="dynamic-security-list"></div>`;
            this.openWindow('Security Logs', html, 460, 300); this.updateSecurityUI();
        } 
        // C. Clic sur Archives Biologiques
        else if (appName === 'database') {
            let html = `<div style="margin-bottom:12px; color:#00ff00; font-weight:bold; font-size:11px;">[STATUT ET INCUBATION DES BIO-ASSETS]</div><div id="dynamic-database-content"></div>`;
            this.openWindow('Bio-Research Archives', html, 440, 300); this.updateDatabaseUI();
        } 
        // D. Clic sur Scanner Réseau
        else if (appName === 'network') {
            let html = `<div style="margin-bottom:10px; color:#00ff00;">● INITIATION DU SCAN RESEAU...</div><div id="net-scan-output" style="background:#020202; border:1px solid #222; padding:8px; height:130px; overflow-y:auto; color:#00ff00; font-size:10px; margin-bottom:10px;">[SYSTEM] Prêt à scanner...</div><button class="nav-btn" style="width:100%; text-align:center;" onclick="UmbrellaApps.runNetworkScan()">LAUNCH DIAGNOSTIC</button>`;
            this.openWindow('Network Scanner', html, 400, 240);
        } 
        // E. Clic sur Décrypteur
        else if (appName === 'decryptor') {
            let html = `<div style="margin-bottom:10px; color:#ffaa00;">FICHIER ACCUMULÉ : <span style="color:#fff;">clearance_manifest.enc</span></div><div style="width:100%; height:12px; background:#111; border:1px solid #444; position:relative; margin-bottom:12px; overflow:hidden;"><div id="decrypt-bar" style="width:0%; height:100%; background:#ffaa00;"></div></div><div id="decrypt-status" style="font-size:10px; color:#888; text-align:center; margin-bottom:10px;">STATUT : EN ATTENTE</div><button class="nav-btn" style="width:100%; text-align:center; color:#ffaa00;" onclick="UmbrellaApps.runDecryption()">INJECT BRUTEFORCE</button>`;
            this.openWindow('File Decrypter', html, 380, 180);
        }
    },


    // ==========================================
    // 4. MISE À JOUR DU TEXTE ET DES RENDER UI
    // ==========================================
    updatePersonnelUI() {
        const container = document.getElementById('dynamic-personnel-table'); if (!container) return;
        let html = `<table style="width:100%; border-collapse:collapse; font-size:11px; text-align:left;"><thead><tr style="border-bottom:1px solid #444; color:#fff;"><th style="padding:4px;">OPERATOR</th><th style="padding:4px;">SUITE NETWORK</th><th style="padding:4px; text-align:right;">DATA SENT</th></tr></thead><tbody>`;
        this.data.personnel.forEach(p => {
            let currentPing = p.status === 'ACTIVE' ? Math.floor(15 + Math.random() * 20) : '---';
            html += `<tr style="border-bottom:1px solid #222;"><td style="padding:6px;"><b style="color:#ff3333;">${p.name}</b><br><small style="color:#666;">${p.role}</small></td><td style="padding:6px; color:#aaa; font-size:10px;">IP: ${p.ip}<br>PING: <span style="color:#00ff00;">${currentPing}ms</span></td><td style="padding:6px; text-align:right; color:#fff;">${p.sent} KB</td></tr>`;
        });
        html += `</tbody></table>`; container.innerHTML = html;
    },

    updateSecurityUI() {
        const container = document.getElementById('dynamic-security-list'); if (!container) return;
        let html = "";
        this.data.security.forEach(s => {
            let badgeColor = s.type === 'CRITICAL' ? '#ff0000' : (s.type === 'WARNING' ? '#ffaa00' : '#00aaff');
            html += `<div style="margin-bottom:8px; padding:6px; background:rgba(20,20,20,0.6); border:1px solid #222; border-left:3px solid ${badgeColor};"><div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span style="color:${badgeColor}; font-weight:bold; font-size:9px;">[${s.type}]</span><small style="color:#555;">${s.date} // ${s.loc}</small></div><span style="color:#ccc; font-size:11px;">${s.log}</span></div>`;
        });
        container.innerHTML = html;
    },

    updateDatabaseUI() {
        const container = document.getElementById('dynamic-database-content'); if (!container) return;
        let html = "";
        this.data.database.forEach(d => {
            let isCritical = d.threat === 'CRITICAL' || d.load > 85; let barColor = isCritical ? '#ff3333' : '#00ff00';
            html += `<div style="margin-bottom:12px;"><div style="display:flex; justify-content:space-between; margin-bottom:2px; font-size:11px;"><span style="color:#fff; font-weight:bold;">ASSET: ${d.project} (<span style="color:#ffaa00;">${d.temp.toFixed(1)}°C</span>)</span><span style="color:${barColor}; font-weight:bold;">${d.load}%</span></div><div style="width:100%; height:6px; background:#111; border:1px solid #333; margin-bottom:2px;"><div style="width:${d.load}%; height:100%; background:${barColor};"></div></div><small style="color:#555;">LOC: ${d.location} | THREAT: ${d.threat}</small></div>`;
        });
        container.innerHTML = html;
    },


    // ==========================================
    // 5. BOUTONS D'ACTIONS INTERACTIFS INTERNES
    // ==========================================
    runNetworkScan() {
        const out = document.getElementById('net-scan-output'); if (!out) return; out.innerHTML = "";
        this.logUserActivity("Fired network analyzer engine.");
        let steps = ["Recherche de passerelles actives...", "Ping envoyé à 10.240.0.1 -> REÇU (0.4ms)", "Analyse IP d'administration...", "Machine trouvée : 10.240.0.12 [ADMIN_DANDRIEN]", "● DIAGNOSTIC TERMINÉ."];
        steps.forEach((text, index) => { setTimeout(() => { out.innerHTML += `> ${text}<br>`; out.scrollTop = out.scrollHeight; }, index * 400); });
    },

    runDecryption() {
        const bar = document.getElementById('decrypt-bar'); const status = document.getElementById('decrypt-status'); if (!bar || !status) return;
        let pct = 0; this.logUserActivity("Injected decryption payload.");
        status.innerHTML = "BRUTEFORCING..."; status.style.color = "#ffaa00";
        let interval = setInterval(() => {
            pct += Math.floor(Math.random() * 8) + 2;
            if (pct >= 100) { pct = 100; clearInterval(interval); status.innerHTML = "ACCÈS ACCORDÉ !"; status.style.color = "#00ff00"; bar.style.background = "#00ff00"; }
            bar.style.width = `${pct}%`;
        }, 150);
    },


    // ==========================================
    // 6. SYSTÈME DE FENÊTRES DE BUREAU (DOM)
    // ==========================================
    openWindow(title, contentHTML, width = 420, height = 240) {
        const layer = document.getElementById('window-layer'); if (!layer) return;
        const winId = `win-${title.replace(/\s+/g, '')}`; const existingWin = document.getElementById(winId);
        if (existingWin) { this.bringToFront(existingWin); return; }
        
        const win = document.createElement('div'); win.id = winId; win.className = 'window-popup';
        win.style.position = 'absolute'; win.style.top = '80px'; win.style.left = '60px'; win.style.width = `${width}px`; win.style.background = '#0a0a0a'; win.style.border = '1px solid #ff3333';
        this.zIndexCounter++; win.style.zIndex = this.zIndexCounter; win.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.3)'; win.style.fontFamily = 'monospace'; win.style.display = 'flex'; win.style.flexDirection = 'column';
        
        win.innerHTML = `<div class="window-header" style="background:#ff3333; color:#000; padding:6px 10px; font-weight:bold; display:flex; justify-content:space-between; align-items:center; user-select:none; cursor:move;"><span style="letter-spacing:1px; font-size:11px;">${title.toUpperCase()}</span><div style="display:flex; gap:8px;"><span class="win-resize-btn" style="cursor:pointer;">[-]</span><span style="cursor:pointer;" onclick="this.parentElement.parentElement.parentElement.remove()">[X]</span></div></div><div class="window-body" style="padding:12px; font-size:11px; color:#aaa; height:${height}px; overflow-y:auto; background:#000; flex:1;">${contentHTML}</div>`;
        layer.appendChild(win); this.makeDraggable(win); this.makeMaximizable(win, height);
        win.addEventListener('mousedown', () => this.bringToFront(win));
    },

    bringToFront(element) { this.zIndexCounter++; element.style.zIndex = this.zIndexCounter; },
    
    makeDraggable(win) {
        const header = win.querySelector('.window-header'); let isDragging = false; let startX, startY, initialLeft, initialTop;
        header.addEventListener('mousedown', (e) => { if (win.classList.contains('maximized')) return; isDragging = true; win.style.transition = 'none'; startX = e.clientX; startY = e.clientY; initialLeft = parseInt(win.style.left, 10) || 0; initialTop = parseInt(win.style.top, 10) || 0; document.addEventListener('mousemove', drag); document.addEventListener('mouseup', stopDrag); });
        function drag(e) { if (!isDragging) return; win.style.left = `${initialLeft + (e.clientX - startX)}px`; win.style.top = `${initialTop + (e.clientY - startY)}px`; }
        function stopDrag() { isDragging = false; win.style.transition = 'all 0.2s ease'; document.removeEventListener('mousemove', drag); document.removeEventListener('mouseup', stopDrag); }
    },
    
    makeMaximizable(win, defaultH) {
        const resizeBtn = win.querySelector('.win-resize-btn'); const body = win.querySelector('.window-body'); let isMaximized = false;
        resizeBtn.addEventListener('click', () => { if (!isMaximized) { win.classList.add('maximized'); win.style.top = '0px'; win.style.left = '0px'; win.style.width = '100%'; win.style.height = '100%'; body.style.height = 'calc(100% - 30px)'; resizeBtn.textContent = '[+]'; isMaximized = true; } else { win.classList.remove('maximized'); win.style.top = '80px'; win.style.left = '60px'; win.style.width = ''; body.style.height = `${defaultH}px`; resizeBtn.textContent = '[-]'; isMaximized = false; } });
    },
    
    registerAppCommands() {
        if (typeof CommandRegistry === 'undefined' || !CommandRegistry.register) return;
        const self = this;
        CommandRegistry.register('personnel', { run() { self.triggerApp('personnel'); return "Exécution..."; } });
        CommandRegistry.register('security', { run() { self.triggerApp('security'); return "Exécution..."; } });
        CommandRegistry.register('database', { run() { self.triggerApp('database'); return "Exécution..."; } });
        CommandRegistry.register('network', { run() { self.triggerApp('network'); return "Exécution..."; } });
        CommandRegistry.register('decryptor', { run() { self.triggerApp('decryptor'); return "Exécution..."; } });
    }
};

document.addEventListener('DOMContentLoaded', () => UmbrellaApps.init());