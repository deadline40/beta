// js/core/appsManager.js — Umbrella Corp Mainframe OS
// 5 applications de la sidebar entièrement reécrites avec UX améliorée

const UmbrellaApps = {

    // ══════════════════════════════════════════════════════════════════
    // 1. BASE DE DONNÉES LIVE
    // ══════════════════════════════════════════════════════════════════
    data: {
        personnel: [
            { id: "EMP-0941", name: "Dandrien Ihonty",  role: "Chief SysAdmin / Web Dev",      status: "ACTIVE",      clearance: 3, ip: "10.240.0.12", sent: 124, locked: false },
            { id: "EMP-1022", name: "Dr. Albert W.",     role: "Director of Bio-Research",       status: "UNVERIFIED",  clearance: 5, ip: "10.240.7.99", sent: 8,   locked: true  },
            { id: "EMP-4042", name: "Annette B.",         role: "Junior IT Technician",           status: "ACTIVE",      clearance: 1, ip: "10.240.2.41", sent: 45,  locked: false },
            { id: "EMP-0099", name: "Dr. Marcus Birkin", role: "Viral Genetics — NIVEAU 5",      status: "MISSING",     clearance: 5, ip: "10.240.9.01", sent: 0,   locked: true  },
            { id: "EMP-0312", name: "Sgt. Klaus Renner", role: "Internal Security — Field Ops",  status: "ACTIVE",      clearance: 3, ip: "10.240.1.55", sent: 312, locked: false },
        ],
        security: [
            { id: 'SEC-001', t: '03:40:02', loc: 'LEVEL -3',   level: 'crit', msg: 'Breach detected — unauthorized entry confirmed.', ack: false },
            { id: 'SEC-002', t: '03:22:16', loc: 'POWER GRID', level: 'warn', msg: 'Backup generator activated. Primary offline.', ack: false },
            { id: 'SEC-003', t: '03:10:44', loc: 'CAM-07',     level: 'warn', msg: 'Surveillance camera 7 offline. Signal lost.', ack: true  },
            { id: 'SEC-004', t: '03:03:04', loc: 'LAB-3',      level: 'crit', msg: 'Loss of contact — Dr. Birkin. Last ping 03:03.', ack: false },
            { id: 'SEC-005', t: '02:47:51', loc: 'DOOR_L3',    level: 'warn', msg: 'Invalid badge detected at Lab-3 entrance.', ack: true  },
            { id: 'SEC-006', t: '02:14:08', loc: 'SECTOR_B',   level: 'info', msg: 'Security patrol sector B — all clear.', ack: true  },
        ],
        database: [
            { id: 'BIO-001', project: "T-VIRUS",       status: "STABLE",     load: 94, temp: 4.2,  location: "Underground Vault",   threat: "HIGH",     containment: true,  progress: 94 },
            { id: 'BIO-002', project: "NE-ALPHA",      status: "IN CUSTODY", load: 42, temp: -18.5, location: "Holding Cell 3",      threat: "CRITICAL", containment: true,  progress: 42 },
            { id: 'BIO-003', project: "REPLIT-AGENTS", status: "COMPILING",  load: 68, temp: 21.0, location: "Cybernetics Division", threat: "LOW",      containment: false, progress: 68 },
            { id: 'BIO-004', project: "G-VIRUS",       status: "QUARANTINE", load: 88, temp: 7.1,  location: "Quarantine Bay 12",   threat: "CRITICAL", containment: true,  progress: 88 },
        ],
        networkNodes: [
            { ip: '10.240.0.1',  host: 'GATEWAY_MAIN',    type: 'ROUTER',   ping: 0,   status: 'PENDING' },
            { ip: '10.240.0.12', host: 'ADMIN_DANDRIEN',  type: 'TERMINAL', ping: 0,   status: 'PENDING' },
            { ip: '10.240.1.55', host: 'SEC_TERMINAL_K',  type: 'TERMINAL', ping: 0,   status: 'PENDING' },
            { ip: '10.240.2.41', host: 'IT_ANNETTE',      type: 'TERMINAL', ping: 0,   status: 'PENDING' },
            { ip: '10.240.7.99', host: 'BIO_RESEARCH_SRV',type: 'SERVER',   ping: 0,   status: 'PENDING' },
            { ip: '10.240.8.00', host: 'UNKNOWN_DEVICE',  type: '???',      ping: 0,   status: 'PENDING' },
            { ip: '10.240.9.01', host: 'DR_BIRKIN_TERM',  type: 'TERMINAL', ping: 0,   status: 'PENDING' },
        ],
    },

    // ══════════════════════════════════════════════════════════════════
    // 2. INIT + BOUCLES TEMPS RÉEL
    // ══════════════════════════════════════════════════════════════════
    init() {
        this.zIndexCounter = 1000;
        this.registerAppCommands();
        this.startGlobalLoops();
        this.startBottomAnimations();
    },

    startGlobalLoops() {
        setInterval(() => {
            this.data.personnel.forEach(p => { if (p.status === 'ACTIVE') p.sent += Math.floor(Math.random() * 15); });
            this.data.database.forEach(d => {
                d.temp  += (Math.random() - 0.5) * 0.4;
                d.load  = Math.min(100, Math.max(10, d.load + Math.floor((Math.random() - 0.5) * 5)));
                d.progress = d.load;
            });
            this.updatePersonnelUI();
            this.updateDatabaseUI();
        }, 1500);

        setInterval(() => {
            const zones = ['SERVER ROOM','LAB-SECTOR_7','CORRIDOR_W','MAIN_GATE','CYBER_DIV','VAULT_B'];
            const pool  = [
                { level: 'info', msg: 'Routine firewall integrity check. No threats detected.' },
                { level: 'info', msg: 'Remote terminal session initiated by operator.' },
                { level: 'warn', msg: 'Power fluctuation detected on cooling grid C.' },
                { level: 'warn', msg: 'Unexpected process spawned on BIO_RESEARCH_SRV.' },
                { level: 'crit', msg: 'Motion sensor triggered — Sector 7 restricted zone.' },
            ];
            const r = pool[Math.floor(Math.random() * pool.length)];
            const z = zones[Math.floor(Math.random() * zones.length)];
            const now = new Date().toTimeString().split(' ')[0];
            const id = 'SEC-' + Date.now();
            this.data.security.unshift({ id, t: now, loc: z, level: r.level, msg: r.msg, ack: false });
            if (this.data.security.length > 8) this.data.security.pop();
            this.updateSecurityUI();
        }, 9000);
    },

    startBottomAnimations() {
        const codeEl = document.getElementById('stream-infinite-code');
        if (codeEl) {
            const lines = [
                `HEX_${Math.random().toString(16).substr(2,5).toUpperCase()} >> PING OK`,
                `SYNC_BLOCK_${Math.floor(Math.random()*8000)} ... SUCCESS`,
                `01001101 01000001 01000100 010240`,
                `LOAD_AVERAGE: ${(Math.random()*2).toFixed(2)} / mem_alloc`,
                `OVERFLOW_PROTECT: STABLE // active_state`,
                `PKT_RECV: 0x${Math.floor(Math.random()*65535).toString(16).toUpperCase()}`,
            ];
            setInterval(() => {
                codeEl.innerHTML += lines[Math.floor(Math.random()*lines.length)] + '<br>';
                const rows = codeEl.innerHTML.split('<br>');
                if (rows.length > 12) codeEl.innerHTML = rows.slice(1).join('<br>');
            }, 350);
        }

        const writerEl = document.getElementById('stream-auto-writer');
        const code = `function initMainframe() {\n  const target = "10.240.0.12";\n  let secure = true;\n  if (secure) {\n    connect(target);\n    loadModules(["T-Virus","NEalpha"]);\n    console.log("System Armed");\n  }\n}`;
        let ci = 0;
        if (writerEl) {
            setInterval(() => {
                if (ci < code.length) {
                    writerEl.innerHTML += code[ci] === '\n' ? '<br>' : code[ci];
                    ci++;
                } else {
                    setTimeout(() => { writerEl.innerHTML = ''; ci = 0; }, 2500);
                }
            }, 55);
        }

        this.logUserActivity('Mainframe terminal initialization complete.');
    },

    logUserActivity(text) {
        const el = document.getElementById('stream-user-activity');
        if (!el) return;
        const now = new Date().toTimeString().split(' ')[0];
        el.innerHTML += `[${now}] ${text}<br>`;
        const rows = el.innerHTML.split('<br>');
        if (rows.length > 11) el.innerHTML = rows.slice(1).join('<br>');
    },


    // ══════════════════════════════════════════════════════════════════
    // 3. DÉCLENCHEMENT DES APPS
    // ══════════════════════════════════════════════════════════════════
    triggerApp(appName) {
        this.currentApp = appName;
        this.logUserActivity(`Opened module: ${appName.toUpperCase()}`);
        const handlers = {
            personnel: () => AppPersonnel.openEmbedded(),
            security:  () => AppSecurity.openEmbedded(),
            database:  () => AppDatabase.openEmbedded(),
            camera:    () => AppCamera.openEmbedded(),
            archive:   () => AppArchive.openEmbedded(),
            reports:   () => AppReports.openEmbedded(),
            network:   () => AppNetwork.openEmbedded(),
            decryptor: () => AppDecrypter.openEmbedded(),
            allessa:   () => AppAllessa.openEmbedded(),
        };
        if (handlers[appName]) handlers[appName]();
    },


    // ══════════════════════════════════════════════════════════════════
    // 4A. USER REGISTRY — fiches interactives avec lock/unlock + filtre
    // ══════════════════════════════════════════════════════════════════
    openPersonnel() {
        const statusColors = { ACTIVE:'#00ff88', UNVERIFIED:'#ffaa00', MISSING:'#ff3333', LOCKED:'#ff6600' };
        const clearanceCols = ['','#00aaff','#00ff88','#ffaa00','#ff6600','#ff0000'];

        const html = `
        <div class="app-toolbar">
            <span class="app-subtitle">◉ USER REGISTRY — LIVE FEED</span>
            <div class="filter-tabs" id="personnel-filter">
                <button class="filter-tab active" data-filter="ALL">ALL</button>
                <button class="filter-tab" data-filter="ACTIVE">ACTIVE</button>
                <button class="filter-tab" data-filter="UNVERIFIED">UNVERIFIED</button>
                <button class="filter-tab" data-filter="MISSING">MISSING</button>
            </div>
        </div>
        <div id="personnel-cards" class="cards-container"></div>`;

        this.openWindow('User Registry', html, 560, 340);

        const renderCards = (filter) => {
            const c = document.getElementById('personnel-cards');
            if (!c) return;
            const data = filter === 'ALL' ? this.data.personnel : this.data.personnel.filter(p => p.status === filter);
            c.innerHTML = '';
            data.forEach(p => {
                const statusCol  = statusColors[p.status] || '#888';
                const clearCol   = clearanceCols[p.clearance] || '#888';
                const isLocked   = p.locked;
                const card = document.createElement('div');
                card.className = 'personnel-card';
                card.innerHTML = `
                    <div class="pc-avatar" style="background:linear-gradient(135deg,#111,#1a0808);border:1px solid ${statusCol}22">
                        <div class="pc-initials" style="color:${statusCol}">${p.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                        <div class="pc-status-dot" style="background:${statusCol};box-shadow:0 0 6px ${statusCol}"></div>
                    </div>
                    <div class="pc-info">
                        <div class="pc-name">${p.name}</div>
                        <div class="pc-role">${p.role}</div>
                        <div class="pc-meta">
                            <span class="pc-badge" style="color:${statusCol};border-color:${statusCol}88">${p.status}</span>
                            <span class="pc-badge" style="color:${clearCol};border-color:${clearCol}88">CLR.${p.clearance}</span>
                            <span class="pc-badge" style="color:#555;border-color:#222">${p.id}</span>
                        </div>
                        <div class="pc-network">
                            <span style="color:#444">IP:</span> <span style="color:#00aaff">${p.ip}</span>
                            &nbsp;|&nbsp;
                            <span style="color:#444">TX:</span> <span style="color:#fff">${p.sent} KB</span>
                            &nbsp;|&nbsp;
                            <span style="color:#444">PING:</span> <span style="color:#00ff88">${p.status==='ACTIVE'?Math.floor(15+Math.random()*25)+'ms':'---'}</span>
                        </div>
                    </div>
                    <div class="pc-actions">
                        <button class="pc-btn ${isLocked?'pc-btn--locked':''}" onclick="UmbrellaApps.toggleLock('${p.id}')">
                            ${isLocked?'🔒 LOCKED':'🔓 LOCK'}
                        </button>
                        <button class="pc-btn pc-btn--trace" onclick="UmbrellaApps.traceOperator('${p.id}','${p.ip}')">
                            ⬡ TRACE
                        </button>
                    </div>`;
                c.appendChild(card);
            });
        };

        setTimeout(() => {
            renderCards('ALL');
            document.querySelectorAll('#personnel-filter .filter-tab').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('#personnel-filter .filter-tab').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    renderCards(btn.dataset.filter);
                });
            });
        }, 0);

        this._personnelRender = renderCards;
    },

    updatePersonnelUI() {
        if (this._personnelRender) {
            const active = document.querySelector('#personnel-filter .filter-tab.active');
            this._personnelRender(active ? active.dataset.filter : 'ALL');
        }
    },

    toggleLock(id) {
        const p = this.data.personnel.find(x => x.id === id);
        if (!p) return;
        p.locked = !p.locked;
        this.logUserActivity(`${p.locked?'LOCKED':'UNLOCKED'} account: ${p.name}`);
        if (this._personnelRender) {
            const active = document.querySelector('#personnel-filter .filter-tab.active');
            this._personnelRender(active ? active.dataset.filter : 'ALL');
        }
    },

    traceOperator(id, ip) {
        const log = document.getElementById('stream-user-activity');
        this.logUserActivity(`TRACE launched on ${id} [${ip}]`);
        const steps = [
            `> ROUTING to ${ip}...`,
            `> TTL: 64 hops — responded`,
            `> GEO: ANTANANARIVO HUB / LOCAL`,
            `> MAC: ${Array.from({length:6},()=>Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()).join(':')}`,
            `> TRACE COMPLETE.`,
        ];
        steps.forEach((s, i) => setTimeout(() => this.logUserActivity(s), i * 300));
    },


    // ══════════════════════════════════════════════════════════════════
    // 4B. SECURITY LOGS — flux live + ACK + filtre niveau
    // ══════════════════════════════════════════════════════════════════
    openSecurity() {
        const html = `
        <div class="app-toolbar">
            <span class="app-subtitle">◉ SECURITY EVENT MONITOR — LIVE</span>
            <div class="filter-tabs" id="sec-filter">
                <button class="filter-tab active" data-level="ALL">ALL</button>
                <button class="filter-tab" data-level="crit">CRITICAL</button>
                <button class="filter-tab" data-level="warn">WARNING</button>
                <button class="filter-tab" data-level="info">INFO</button>
            </div>
        </div>
        <div class="sec-stats" id="sec-stats"></div>
        <div id="security-list" class="sec-list"></div>`;

        this.openWindow('Security Logs', html, 520, 360);

        setTimeout(() => {
            this.updateSecurityUI();
            document.querySelectorAll('#sec-filter .filter-tab').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('#sec-filter .filter-tab').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this._secFilter = btn.dataset.level;
                    this.updateSecurityUI();
                });
            });
        }, 0);
    },

    updateSecurityUI() {
        const list  = document.getElementById('security-list');
        const stats = document.getElementById('sec-stats');
        if (!list) return;

        const filter  = this._secFilter || 'ALL';
        const levelCol = { crit:'#ff3333', warn:'#ffaa00', info:'#00aaff' };
        const levelLbl = { crit:'CRITICAL', warn:'WARNING', info:'INFO' };

        // Stats bar
        if (stats) {
            const crits  = this.data.security.filter(s=>s.level==='crit').length;
            const warns  = this.data.security.filter(s=>s.level==='warn').length;
            const unack  = this.data.security.filter(s=>!s.ack).length;
            stats.innerHTML = `
                <span class="sec-stat" style="color:#ff3333">⬤ CRIT: ${crits}</span>
                <span class="sec-stat" style="color:#ffaa00">⬤ WARN: ${warns}</span>
                <span class="sec-stat" style="color:#00aaff">⬤ INFO: ${this.data.security.filter(s=>s.level==='info').length}</span>
                <span class="sec-stat sec-stat--unack" style="color:${unack>0?'#ff3333':'#00ff88'}">⚠ UNACK: ${unack}</span>`;
        }

        const visible = filter === 'ALL' ? this.data.security : this.data.security.filter(s => s.level === filter);
        list.innerHTML = '';
        visible.forEach((s, idx) => {
            const col = levelCol[s.level] || '#888';
            const row = document.createElement('div');
            row.className = `sec-row sec-row--${s.level} ${s.ack ? 'sec-row--ack' : ''}`;
            row.style.animationDelay = `${idx * 0.05}s`;
            row.innerHTML = `
                <div class="sec-row-head">
                    <span class="sec-level-badge" style="color:${col};border-color:${col}55;background:${col}11">${levelLbl[s.level]||s.level.toUpperCase()}</span>
                    <span class="sec-loc" style="color:#555">${s.loc}</span>
                    <span class="sec-time" style="color:#333">${s.t}</span>
                    ${!s.ack ? `<button class="sec-ack-btn" onclick="UmbrellaApps.ackEvent('${s.id}')">ACK</button>` : '<span class="sec-acked">✓ ACK</span>'}
                </div>
                <div class="sec-msg" style="color:${s.ack?'#444':'#ccc'}">${s.msg}</div>`;
            list.appendChild(row);
        });
    },

    ackEvent(id) {
        const s = this.data.security.find(x => x.id === id);
        if (s) { s.ack = true; this.logUserActivity(`ACK: ${id} — ${s.loc}`); this.updateSecurityUI(); }
    },


    // ══════════════════════════════════════════════════════════════════
    // 4C. BIO-ARCHIVES — cartes avec canvas mini + actions PURGE/INJECT
    // ══════════════════════════════════════════════════════════════════
    openDatabase() {
        const html = `
        <div class="app-toolbar">
            <span class="app-subtitle">◉ BIO-RESEARCH ARCHIVES — CONTAINMENT STATUS</span>
        </div>
        <div id="database-cards" class="bio-cards"></div>`;

        this.openWindow('Bio-Research Archives', html, 540, 380);
        setTimeout(() => this.updateDatabaseUI(), 0);
    },

    updateDatabaseUI() {
        const c = document.getElementById('database-cards');
        if (!c) return;
        const threatCol  = { LOW:'#00aaff', MEDIUM:'#ffaa00', HIGH:'#ff6600', CRITICAL:'#ff0000' };
        const statusCol  = { STABLE:'#00ff88', 'IN CUSTODY':'#ffaa00', COMPILING:'#00aaff', QUARANTINE:'#ff3333' };

        c.innerHTML = '';
        this.data.database.forEach(d => {
            const tc = threatCol[d.threat] || '#888';
            const sc = statusCol[d.status] || '#888';
            const pct = Math.min(100, Math.max(0, d.load));
            const barCol = pct > 85 ? '#ff3333' : pct > 60 ? '#ffaa00' : '#00ff88';
            const card = document.createElement('div');
            card.className = 'bio-card';
            card.innerHTML = `
                <div class="bio-card-header">
                    <div>
                        <div class="bio-name">${d.project}</div>
                        <div class="bio-id">${d.id} — ${d.location}</div>
                    </div>
                    <div style="text-align:right">
                        <span class="bio-badge" style="color:${tc};border-color:${tc}55;background:${tc}11">THREAT: ${d.threat}</span><br>
                        <span class="bio-badge" style="color:${sc};border-color:${sc}55;background:${sc}11;margin-top:3px">${d.status}</span>
                    </div>
                </div>
                <div class="bio-metrics">
                    <div class="bio-metric">
                        <span style="color:#444">LOAD</span>
                        <span style="color:${barCol};font-weight:bold">${pct}%</span>
                    </div>
                    <div class="bio-metric">
                        <span style="color:#444">TEMP</span>
                        <span style="color:#fff">${d.temp.toFixed(1)}°C</span>
                    </div>
                    <div class="bio-metric">
                        <span style="color:#444">CONTAIN</span>
                        <span style="color:${d.containment?'#00ff88':'#ff3333'}">${d.containment?'SEALED':'OPEN'}</span>
                    </div>
                </div>
                <div class="bio-bar-track">
                    <div class="bio-bar-fill" style="width:${pct}%;background:${barCol};box-shadow:0 0 8px ${barCol}88"></div>
                    <div class="bio-bar-label">${pct}% CONTAINMENT LOAD</div>
                </div>
                <div class="bio-actions">
                    <button class="bio-btn bio-btn--purge" onclick="UmbrellaApps.bioPurge('${d.id}')">⬡ PURGE</button>
                    <button class="bio-btn bio-btn--inject" onclick="UmbrellaApps.bioInject('${d.id}')">▶ INJECT</button>
                    <button class="bio-btn bio-btn--seal" onclick="UmbrellaApps.bioToggleSeal('${d.id}')">
                        ${d.containment?'🔒 UNSEAL':'🔓 SEAL'}
                    </button>
                    <canvas class="bio-sparkline" id="spark-${d.id}" width="80" height="28"></canvas>
                </div>`;
            c.appendChild(card);
            this._drawSparkline(d.id, pct, barCol);
        });
    },

    _sparkData: {},
    _drawSparkline(id, newVal, col) {
        if (!this._sparkData[id]) this._sparkData[id] = [];
        this._sparkData[id].push(newVal);
        if (this._sparkData[id].length > 20) this._sparkData[id].shift();
        const cv = document.getElementById('spark-' + id);
        if (!cv) return;
        const ctx = cv.getContext('2d');
        ctx.clearRect(0, 0, 80, 28);
        const data = this._sparkData[id];
        ctx.strokeStyle = col; ctx.lineWidth = 1.5;
        ctx.shadowColor = col; ctx.shadowBlur = 4;
        ctx.beginPath();
        data.forEach((v, i) => {
            const x = (i / (data.length - 1)) * 76 + 2;
            const y = 26 - (v / 100) * 22;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
    },

    bioPurge(id) {
        const d = this.data.database.find(x => x.id === id);
        if (!d) return;
        this.logUserActivity(`PURGE initiated on ${d.project}`);
        const orig = d.load;
        let step = 0;
        const iv = setInterval(() => {
            d.load = Math.max(5, orig - step * 6);
            step++;
            this.updateDatabaseUI();
            if (d.load <= 5) { clearInterval(iv); d.status = 'STABLE'; this.logUserActivity(`PURGE complete: ${d.project}`); this.updateDatabaseUI(); }
        }, 200);
    },

    bioInject(id) {
        const d = this.data.database.find(x => x.id === id);
        if (!d) return;
        this.logUserActivity(`INJECT payload sent to ${d.project}`);
        let step = 0;
        const iv = setInterval(() => {
            d.load = Math.min(100, d.load + 4);
            step++;
            this.updateDatabaseUI();
            if (step >= 8) { clearInterval(iv); this.logUserActivity(`INJECT complete: ${d.project}`); }
        }, 180);
    },

    bioToggleSeal(id) {
        const d = this.data.database.find(x => x.id === id);
        if (!d) return;
        d.containment = !d.containment;
        this.logUserActivity(`${d.containment?'SEALED':'UNSEALED'} containment: ${d.project}`);
        this.updateDatabaseUI();
    },


    // ══════════════════════════════════════════════════════════════════
    // 4D. NETWORK SCAN — scan IP animé + topology + statuts
    // ══════════════════════════════════════════════════════════════════
    openNetwork() {
        const html = `
        <div class="app-toolbar">
            <span class="app-subtitle">◉ NETWORK DIAGNOSTIC — SUBNET 10.240.0.0/16</span>
            <button class="app-action-btn" id="net-launch-btn" onclick="UmbrellaApps.runNetworkScan()">▶ LAUNCH SCAN</button>
        </div>
        <div id="net-nodes" class="net-nodes"></div>
        <div id="net-log" class="net-log">[SYSTEM] Ready — press LAUNCH SCAN to begin...<br></div>`;

        this.openWindow('Network Scanner', html, 540, 380);
        // Reset node states
        this.data.networkNodes.forEach(n => { n.status = 'PENDING'; n.ping = 0; });
        setTimeout(() => this.renderNetNodes(), 0);
    },

    renderNetNodes() {
        const c = document.getElementById('net-nodes');
        if (!c) return;
        const typeIcons = { ROUTER:'⬡', TERMINAL:'◈', SERVER:'▣', '???':'?' };
        const stCols    = { PENDING:'#333', SCANNING:'#ffaa00', ONLINE:'#00ff88', OFFLINE:'#ff3333', SUSPECT:'#ff6600' };
        c.innerHTML = '';
        this.data.networkNodes.forEach(n => {
            const col = stCols[n.status] || '#333';
            const div = document.createElement('div');
            div.className = `net-node net-node--${n.status.toLowerCase()}`;
            div.innerHTML = `
                <div class="net-node-icon" style="color:${col};border-color:${col}55;text-shadow:0 0 8px ${col}">${typeIcons[n.type]||'◈'}</div>
                <div class="net-node-info">
                    <div class="net-node-host" style="color:${n.status==='ONLINE'?'#fff':'#666'}">${n.host}</div>
                    <div class="net-node-ip">${n.ip}</div>
                    <div class="net-node-type" style="color:#333">${n.type}</div>
                </div>
                <div class="net-node-status">
                    <span style="color:${col};font-size:9px;font-weight:bold">${n.status}</span>
                    ${n.ping ? `<br><span style="color:#00ff88;font-size:8px">${n.ping}ms</span>` : ''}
                </div>`;
            c.appendChild(div);
        });
    },

    runNetworkScan() {
        const log = document.getElementById('net-log');
        const btn = document.getElementById('net-launch-btn');
        if (!log) return;
        if (btn) { btn.disabled = true; btn.textContent = '⏳ SCANNING...'; }
        this.data.networkNodes.forEach(n => { n.status = 'PENDING'; n.ping = 0; });
        log.innerHTML = '';
        this.logUserActivity('Network scan initiated.');

        const print = (txt, col='#00ff88') => {
            log.innerHTML += `<span style="color:${col}">${txt}</span><br>`;
            log.scrollTop = log.scrollHeight;
        };

        print('> Initializing subnet sweep 10.240.0.0/16...', '#ffaa00');
        print('> TTL: 64 | Protocol: ICMP', '#555');

        this.data.networkNodes.forEach((n, i) => {
            setTimeout(() => {
                n.status = 'SCANNING';
                this.renderNetNodes();
                print(`> Pinging ${n.ip} [${n.host}]...`, '#777');

                setTimeout(() => {
                    const online = n.host !== 'UNKNOWN_DEVICE' && n.host !== 'DR_BIRKIN_TERM';
                    const suspect = n.host === 'UNKNOWN_DEVICE';
                    n.ping   = online ? Math.floor(8 + Math.random() * 40) : 0;
                    n.status = suspect ? 'SUSPECT' : online ? 'ONLINE' : 'OFFLINE';
                    this.renderNetNodes();
                    if (suspect)      print(`  !! ${n.ip} SUSPECT — Unknown device signature detected`, '#ff6600');
                    else if (online)  print(`  ✓ ${n.ip} ONLINE — ${n.ping}ms`, '#00ff88');
                    else              print(`  ✗ ${n.ip} OFFLINE — no response`, '#ff3333');

                    if (i === this.data.networkNodes.length - 1) {
                        setTimeout(() => {
                            const online = this.data.networkNodes.filter(x=>x.status==='ONLINE').length;
                            const suspect = this.data.networkNodes.filter(x=>x.status==='SUSPECT').length;
                            const offline = this.data.networkNodes.filter(x=>x.status==='OFFLINE').length;
                            print('━'.repeat(40), '#222');
                            print(`> SCAN COMPLETE — ${online} ONLINE | ${suspect} SUSPECT | ${offline} OFFLINE`, '#fff');
                            if (suspect > 0) print('> ⚠ WARNING: Unknown device on subnet — investigate', '#ff6600');
                            if (btn) { btn.disabled = false; btn.textContent = '▶ RESCAN'; }
                            this.logUserActivity('Network scan complete.');
                        }, 400);
                    }
                }, 500 + Math.random() * 300);
            }, i * 700);
        });
    },


    // ══════════════════════════════════════════════════════════════════
    // 4E. FILE DECRYPTER — bruteforce hex animé + révélation fichier
    // ══════════════════════════════════════════════════════════════════
    openDecryptor() {
        const FILES = [
            { name: 'clearance_manifest.enc', size: '12.4 KB', secret: 'UMBRELLA CORP — INTERNAL DIRECTIVE\nFILE: clearance_manifest.v3\nAUTHOR: Albert Wesker\n\nALL LEVEL 5 personnel are authorized to access\nBio-weapon deployment protocol DELTA-9.\nConfirm with retinal scan.\n\n[END OF DOCUMENT]' },
            { name: 'birkin_notes.enc',        size: '4.1 KB',  secret: 'DR. BIRKIN — PRIVATE LOG\nDATE: 1998-09-27\n\nThe G-Virus is ready. I will not hand it over.\nIf they come for me — I know what to do.\nWilliam.' },
        ];
        let fileIdx = 0;

        const html = `
        <div class="app-toolbar">
            <span class="app-subtitle">◉ FILE DECRYPTER — BRUTE-FORCE ENGINE</span>
        </div>
        <div class="dec-file-selector" id="dec-file-selector">
            ${FILES.map((f,i)=>`<div class="dec-file-item ${i===0?'dec-file-item--active':''}" data-idx="${i}" onclick="UmbrellaApps._selectDecFile(${i})">
                <span style="color:#ffaa00">🔒</span>
                <span class="dec-fname">${f.name}</span>
                <span class="dec-fsize" style="color:#333">${f.size}</span>
            </div>`).join('')}
        </div>
        <div id="dec-hex-view" class="dec-hex-view"></div>
        <div class="dec-progress-row">
            <div class="dec-progress-track"><div id="dec-bar" class="dec-bar"></div></div>
            <span id="dec-pct" style="color:#ffaa00;font-size:10px;min-width:36px">0%</span>
        </div>
        <div id="dec-status" class="dec-status">STATUS: IDLE — SELECT A FILE</div>
        <div class="dec-btns">
            <button class="app-action-btn" onclick="UmbrellaApps.runDecryption()">⚡ INJECT BRUTEFORCE</button>
            <button class="app-action-btn" style="color:#888;border-color:#333" onclick="UmbrellaApps.resetDecryptor()">↺ RESET</button>
        </div>
        <div id="dec-output" class="dec-output" style="display:none"></div>`;

        this.openWindow('File Decrypter', html, 500, 420);
        this._decFiles  = FILES;
        this._decFileIdx = 0;
        this._decRunning = false;
        setTimeout(() => this._renderHexDump(FILES[0].name), 0);
    },

    _selectDecFile(idx) {
        if (this._decRunning) return;
        this._decFileIdx = idx;
        document.querySelectorAll('.dec-file-item').forEach((el,i) => {
            el.classList.toggle('dec-file-item--active', i === idx);
        });
        const bar = document.getElementById('dec-bar');
        const pct = document.getElementById('dec-pct');
        const status = document.getElementById('dec-status');
        const out = document.getElementById('dec-output');
        if (bar) { bar.style.width = '0%'; bar.style.background = '#ffaa00'; }
        if (pct) pct.textContent = '0%';
        if (status) { status.textContent = 'STATUS: IDLE — READY'; status.style.color = '#888'; }
        if (out)  { out.style.display = 'none'; out.textContent = ''; }
        this._renderHexDump(this._decFiles[idx].name);
    },

    _renderHexDump(seed) {
        const hex = document.getElementById('dec-hex-view');
        if (!hex) return;
        let out = '';
        for (let row = 0; row < 6; row++) {
            const addr = (row * 16).toString(16).padStart(4,'0').toUpperCase();
            let bytes = '';
            for (let b = 0; b < 16; b++) {
                bytes += Math.floor(Math.random()*256).toString(16).padStart(2,'0').toUpperCase() + ' ';
            }
            out += `<span style="color:#333">${addr}:</span> <span style="color:#ff6600">${bytes.trim()}</span><br>`;
        }
        hex.innerHTML = out;
    },

    _hexScrambleInterval: null,
    runDecryption() {
        if (this._decRunning) return;
        const file   = this._decFiles[this._decFileIdx];
        const bar    = document.getElementById('dec-bar');
        const pct    = document.getElementById('dec-pct');
        const status = document.getElementById('dec-status');
        const out    = document.getElementById('dec-output');
        if (!bar || !status) return;

        this._decRunning = true;
        this.logUserActivity(`Bruteforce started on ${file.name}`);

        let progress = 0;
        status.textContent = 'STATUS: BRUTEFORCING...';
        status.style.color = '#ffaa00';
        out.style.display  = 'none';

        // Scramble hex display while cracking
        clearInterval(this._hexScrambleInterval);
        this._hexScrambleInterval = setInterval(() => this._renderHexDump(file.name), 120);

        const iv = setInterval(() => {
            progress = Math.min(100, progress + Math.floor(Math.random() * 5) + 1);
            bar.style.width = progress + '%';
            if (pct) pct.textContent = progress + '%';

            if (progress >= 100) {
                clearInterval(iv);
                clearInterval(this._hexScrambleInterval);
                this._decRunning = false;

                bar.style.background = '#00ff88';
                bar.style.boxShadow  = '0 0 12px #00ff88';
                status.textContent   = 'STATUS: DECRYPTION SUCCESSFUL';
                status.style.color   = '#00ff88';
                this.logUserActivity(`DECRYPTED: ${file.name}`);

                // Affiche le contenu décrypté lettre par lettre
                out.style.display = 'block';
                out.textContent   = '';
                let ci = 0;
                const typeIv = setInterval(() => {
                    if (ci < file.secret.length) {
                        out.textContent += file.secret[ci++];
                        out.scrollTop = out.scrollHeight;
                    } else clearInterval(typeIv);
                }, 18);
            }
        }, 80);
    },

    resetDecryptor() {
        clearInterval(this._hexScrambleInterval);
        this._decRunning = false;
        const bar    = document.getElementById('dec-bar');
        const pct    = document.getElementById('dec-pct');
        const status = document.getElementById('dec-status');
        const out    = document.getElementById('dec-output');
        if (bar)    { bar.style.width='0%'; bar.style.background='#ffaa00'; bar.style.boxShadow='none'; }
        if (pct)    pct.textContent = '0%';
        if (status) { status.textContent='STATUS: RESET — IDLE'; status.style.color='#888'; }
        if (out)    { out.style.display='none'; out.textContent=''; }
        if (this._decFiles) this._renderHexDump(this._decFiles[this._decFileIdx].name);
    },


    // ══════════════════════════════════════════════════════════════════
    // 5. FENÊTRE POPUP GÉNÉRIQUE
    // ══════════════════════════════════════════════════════════════════
    openWindow(title, contentHTML, width = 440, height = 300) {
        const layer = document.getElementById('window-layer');
        if (!layer) return;
        const winId = `win-${title.replace(/\s+/g, '-')}`;
        const existing = document.getElementById(winId);
        if (existing) { this.bringToFront(existing); return; }

        const win = document.createElement('div');
        win.id = winId;
        win.className = 'window-popup';
        Object.assign(win.style, {
            position:'absolute', top:'40px', left:'40px',
            width:`${width}px`, background:'#050505',
            border:'1px solid #ff333355', borderRadius:'2px',
            boxShadow:'0 0 30px rgba(255,0,0,0.15), 0 20px 60px rgba(0,0,0,0.8)',
            fontFamily:'monospace', display:'flex', flexDirection:'column',
            zIndex: ++this.zIndexCounter,
        });

        win.innerHTML = `
            <div class="window-header" style="background:linear-gradient(90deg,#1a0000,#0a0a0a);color:#ff3333;padding:7px 10px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;user-select:none;cursor:move;border-bottom:1px solid #ff333333;letter-spacing:1px;font-size:11px;">
                <span>⬡ ${title.toUpperCase()}</span>
                <div style="display:flex;gap:6px;align-items:center">
                    <span class="win-resize-btn" style="cursor:pointer;color:#555;padding:0 4px" title="Maximize">[-]</span>
                    <span style="cursor:pointer;color:#ff3333;padding:0 4px" onclick="document.getElementById('${winId}').remove()">✕</span>
                </div>
            </div>
            <div class="window-body" style="padding:10px;font-size:11px;color:#aaa;height:${height}px;overflow-y:auto;background:#030303;flex:1">${contentHTML}</div>`;

        layer.appendChild(win);
        this.makeDraggable(win);
        this.makeMaximizable(win, height);
        win.addEventListener('mousedown', () => this.bringToFront(win));
    },

    bringToFront(el) { el.style.zIndex = ++this.zIndexCounter; },

    makeDraggable(win) {
        const header = win.querySelector('.window-header');
        let drag = false, sx, sy, il, it;
        header.addEventListener('mousedown', e => {
            if (win.classList.contains('maximized')) return;
            drag = true; sx = e.clientX; sy = e.clientY;
            il = parseInt(win.style.left)||0; it = parseInt(win.style.top)||0;
            win.style.transition = 'none';
            const mm = e2 => { if (drag) { win.style.left=`${il+(e2.clientX-sx)}px`; win.style.top=`${it+(e2.clientY-sy)}px`; }};
            const mu = ()  => { drag=false; win.style.transition=''; document.removeEventListener('mousemove',mm); document.removeEventListener('mouseup',mu); };
            document.addEventListener('mousemove', mm);
            document.addEventListener('mouseup', mu);
        });
    },

    makeMaximizable(win, defaultH) {
        const btn  = win.querySelector('.win-resize-btn');
        const body = win.querySelector('.window-body');
        let max    = false;
        btn.addEventListener('click', () => {
            if (!max) {
                win.classList.add('maximized');
                Object.assign(win.style, {top:'0',left:'0',width:'100%',height:'100%'});
                body.style.height = 'calc(100% - 30px)';
                btn.textContent = '[+]'; max = true;
            } else {
                win.classList.remove('maximized');
                Object.assign(win.style, {top:'40px',left:'40px',width:'',height:''});
                body.style.height = `${defaultH}px`;
                btn.textContent = '[-]'; max = false;
            }
        });
    },

    registerAppCommands() {
        if (typeof CommandRegistry === 'undefined') return;
        ['personnel','security','database','network','decryptor'].forEach(name => {
            CommandRegistry.register(name, `ouvre le module ${name}`, (args, term) => {
                this.triggerApp(name); term.print('ok', `Module ${name} chargé.`);
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => UmbrellaApps.init());