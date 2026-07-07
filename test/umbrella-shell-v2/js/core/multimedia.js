// js/core/multimedia.js

const UmbrellaMainframe = {
    init() {
        this.initSystem();
        this.initCamera();
        // Globe remplacé par worldmap.js (UmbrellaWorldMap)
        this.registerCommands();
        window.addEventListener('resize', () => this.resizeCanvas());
    },

    // --- MONITEUR SYSTEME (BARRES & ALERTES) ---
    initSystem() {
        this.cpuBar = document.getElementById('cpu-bar');
        this.sysTemp = document.getElementById('sys-temp');
        this.sysAlert = document.getElementById('sys-alert');
        
        setInterval(() => {
            const isRed = this.sysAlert && this.sysAlert.classList.contains('alert-red');
            const base = isRed ? 75 : 15;
            const load = Math.floor(base + Math.random() * 20);
            const temp = Math.floor(35 + (load * 0.3));
            
            if (this.cpuBar) this.cpuBar.style.width = `${load}%`;
            if (this.sysTemp) this.sysTemp.textContent = `${temp}°C`;
        }, 2000);

        if (typeof EventBus !== 'undefined') {
            EventBus.on('system:alertChange', (level) => this.updateAlert(level));
        }
    },

    updateAlert(level) {
        if (!this.sysAlert) return;
        this.sysAlert.className = '';
        if (['red', 'danger'].includes(level.toLowerCase())) {
            this.sysAlert.textContent = 'DANGER';
            this.sysAlert.classList.add('alert-red');
        } else if (['yellow', 'caution'].includes(level.toLowerCase())) {
            this.sysAlert.textContent = 'CAUTION';
            this.sysAlert.classList.add('alert-yellow');
        } else {
            this.sysAlert.textContent = 'CLEAR';
            this.sysAlert.classList.add('alert-green');
        }
    },

    // --- FLUX MULTI-CAMÉRAS ---
    initCamera() {
        this.camCanvas = document.getElementById('cam-canvas');
        if (!this.camCanvas) return;
        this.camCtx = this.camCanvas.getContext('2d');
        this.camLabel = document.getElementById('cam-label');
        this.camId = 1;

        this.cameraZones = {
            1: { name: "LAB-SECTOR_7", info: "BIO-HAZARD ACC", alert: true },
            2: { name: "SERVER_MAIN", info: "MAINFRAME LOCK", alert: false },
            3: { name: "CORRIDOR_W", info: "SECURE ZONE", alert: false },
            4: { name: "MAIN_GATE", info: "EXTERNAL TRACK", alert: false }
        };

        // Rotation auto toutes les 6 sec
        setInterval(() => {
            let next = this.camId + 1;
            if (next > 4) next = 1;
            this.switchCamera(next);
        }, 6000);

        this.resizeCanvas();
        this.animateCamera();
    },

    animateCamera() {
        if (!this.camCtx) return;
        const ctx = this.camCtx;
        const w = this.camCanvas.width;
        const h = this.camCanvas.height;
        const zone = this.cameraZones[this.camId];

        ctx.fillStyle = zone.alert ? '#120202' : '#030a05';
        ctx.fillRect(0, 0, w, h);

        // Dessin des pièces
        ctx.strokeStyle = zone.alert ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,100,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (this.camId % 2 === 1) {
            ctx.rect(w*0.3, h*0.3, w*0.4, h*0.4);
            ctx.moveTo(0,0); ctx.lineTo(w*0.3, h*0.3);
            ctx.moveTo(w,0); ctx.lineTo(w*0.7, h*0.3);
            ctx.moveTo(0,h); ctx.lineTo(w*0.3, h*0.7);
            ctx.moveTo(w,h); ctx.lineTo(w*0.7, h*0.7);
        } else {
            for(let i=1; i<4; i++) ctx.strokeRect(w*(0.2*i), h*0.2, w*0.15, h*0.6);
        }
        ctx.stroke();

        // Bruit vidéo satellite
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        const noise = Math.random() > 0.98 ? 140 : 25;
        for (let i = 0; i < d.length; i += 4) {
            let n = (Math.random() - 0.5) * noise;
            d[i] = Math.min(255, Math.max(0, d[i] + n + (zone.alert?20:0)));
            d[i+1] = Math.min(255, Math.max(0, d[i+1] + n + (zone.alert?0:15)));
            d[i+2] = Math.min(255, Math.max(0, d[i+2] + n));
        }
        ctx.putImageData(imgData, 0, 0);

        // HUD Texte
        ctx.fillStyle = zone.alert ? '#ff3333' : '#00ff00';
        ctx.font = '9px monospace';
        ctx.fillText(`● FEED_LIVE [CAM-0${this.camId}]`, 10, 15);
        ctx.fillText(`LOC: ${zone.name}`, 10, 28);
        ctx.fillText(`SYS: ${zone.info}`, 10, h - 10);

        if (this.camLabel) this.camLabel.textContent = `CAM: ${zone.name}`;
        requestAnimationFrame(() => this.animateCamera());
    },

    switchCamera(id) {
        if (this.cameraZones[id]) {
            this.camId = id;
            if (this.camCtx) {
                this.camCtx.fillStyle = '#ffffff';
                this.camCtx.fillRect(0, 0, this.camCanvas.width, this.camCanvas.height);
            }
        }
    },

    // Globe remplacé par worldmap.js — plus de rendu ici
    initGlobe() {},
    animateGlobe() {},

    resizeCanvas() {
        if (this.camCanvas) {
            this.camCanvas.width = this.camCanvas.parentElement.clientWidth;
            this.camCanvas.height = this.camCanvas.parentElement.clientHeight;
        }
        // map-canvas géré par worldmap.js
    },

    // --- ENREGISTREMENT DES COMMANDES DANS LE TERMINAL ---
    registerCommands() {
        if (typeof CommandRegistry === 'undefined') return;

        CommandRegistry.register('cam', 'gestion des caméras de surveillance: cam list | cam switch <1-4>', (args, term) => {
            if (!args || args.length === 0) return term.print('err', 'usage : cam switch [1-4] ou cam list');
            const sub = args[0].toLowerCase();
            if (sub === 'list') {
                term.printLines([
                    { t: 'res', v: 'Caméras :' },
                    { t: 'res', v: ' 1: LAB-SECTOR_7' },
                    { t: 'res', v: ' 2: SERVER_MAIN' },
                    { t: 'res', v: ' 3: CORRIDOR_W' },
                    { t: 'res', v: ' 4: MAIN_GATE' }
                ]);
                return;
            }
            if (sub === 'switch' && args[1]) {
                const id = parseInt(args[1], 10);
                if (id >= 1 && id <= 4) {
                    UmbrellaMainframe.switchCamera(id);
                    term.print('ok', `Connexion forcée sur CAM-0${id}...`);
                    return;
                }
            }
            term.print('err', 'ID invalide.');
        });

        CommandRegistry.register('sys', 'alerte système: sys alert <green|yellow|red>', (args, term) => {
            if (args && args[0] === 'alert' && args[1]) {
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('system:alertChange', args[1]);
                    term.print('ok', `Alerte passée en mode: ${args[1].toUpperCase()}`);
                    return;
                }
            }
            term.print('err', 'usage : sys alert [green/yellow/red]');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => UmbrellaMainframe.init());