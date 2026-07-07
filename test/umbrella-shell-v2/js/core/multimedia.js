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
        this.camVideos = Array.from(document.querySelectorAll('#camera-feed .cam-video'));
        this.camLabels = Array.from(document.querySelectorAll('#camera-feed .cam-label'));
        if (!this.camVideos.length) return;

        this.videoSources = [
            'assets/videos/1105533363-preview.mp4',
            'assets/videos/3510927063-preview.mp4',
            'assets/videos/3788587813-preview.mp4'
        ];

        this.cameraZones = {
            1: { name: "LAB-SECTOR_7", info: "BIO-HAZARD ACC", alert: true },
            2: { name: "SERVER_MAIN", info: "MAINFRAME LOCK", alert: false },
            3: { name: "CORRIDOR_W", info: "SECURE ZONE", alert: false },
            4: { name: "MAIN_GATE", info: "EXTERNAL TRACK", alert: false }
        };

        this.camVideos.forEach((video) => {
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.style.objectFit = 'cover';
        });

        this.loadRandomVideos();
        setInterval(() => this.loadRandomVideos(), 10000);
    },

    loadRandomVideos() {
        if (!this.camVideos.length) return;
        const shuffled = [...this.videoSources].sort(() => Math.random() - 0.5);

        this.camVideos.forEach((video, idx) => {
            const nextSource = shuffled[idx % shuffled.length];
            if (video.src && video.src.includes(nextSource)) return;
            video.src = nextSource;
            video.play().catch(() => {});
            const labelText = this.camLabels[idx] ? `FEED ${String(idx + 1).padStart(2, '0')} • ${nextSource.split('/').pop()}` : null;
            if (labelText && this.camLabels[idx]) {
                this.camLabels[idx].textContent = labelText;
            }
        });
    },

    switchCamera(id) {
        if (!this.camVideos.length) return;
        const zone = this.cameraZones[id];
        if (!zone) return;
        this.camVideos.forEach((video, idx) => {
            const source = this.videoSources[(id - 1 + idx) % this.videoSources.length];
            video.src = source;
            video.play().catch(() => {});
            if (this.camLabels[idx]) {
                this.camLabels[idx].textContent = `CAM-${id} ${zone.name} • ${source.split('/').pop()}`;
            }
        });
    },

    // Globe remplacé par worldmap.js — plus de rendu ici
    initGlobe() {},
    animateGlobe() {},

    resizeCanvas() {
        if (this.camVideo) {
            this.camVideo.style.width = '100%';
            this.camVideo.style.height = '100%';
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