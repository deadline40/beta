// js/core/systemMonitor.js

const SystemMonitor = {
    init() {
        this.cacheDOM();
        this.startSimulation();
        this.setupEventListenres();
    },

    cacheDOM() {
        this.cpuBar = document.getElementById('cpu-bar');
        this.sysTemp = document.getElementById('sys-temp');
        this.sysAlert = document.getElementById('sys-alert');
        this.userClearance = document.getElementById('user-clearance');
    },

    setupEventListenres() {
        // Écouter les futurs changements d'alerte venant du terminal via l'EventBus
        if (typeof EventBus !== 'undefined') {
            EventBus.on('system:alertChange', (newLevel) => {
                this.updateAlertLevel(newLevel);
            });
            EventBus.on('user:clearanceChange', (newLevel) => {
                this.userClearance.textContent = `LEVEL ${newLevel}`;
            });
        }
    },

    startSimulation() {
        // Simulation des fluctuations du CPU et de la Température toutes les 2 secondes
        setInterval(() => {
            // Fluctuation CPU entre 10% et 45% en état normal
            const isAlert = this.sysAlert.classList.contains('alert-red');
            const baseCPU = isAlert ? 75 : 20;
            const randomCPU = Math.floor(baseCPU + (Math.random() * 20 - 10));
            const clampedCPU = Math.max(5, Math.min(99, randomCPU));

            // Ajustement de la température en fonction du CPU
            const temp = Math.floor(35 + (clampedCPU * 0.3) + (Math.random() * 2));

            // Mise à jour de l'affichage
            if (this.cpuBar) this.cpuBar.style.width = `${clampedCPU}%`;
            if (this.sysTemp) this.sysTemp.textContent = `${temp}°C`;
        }, 2000);
    },

    updateAlertLevel(level) {
        if (!this.sysAlert) return;
        
        // Reset des classes
        this.sysAlert.className = '';
        
        switch(level.toLowerCase()) {
            case 'green':
            case 'clear':
                this.sysAlert.textContent = 'CLEAR';
                this.sysAlert.classList.add('alert-green');
                break;
            case 'yellow':
            case 'caution':
                this.sysAlert.textContent = 'CAUTION';
                this.sysAlert.classList.add('alert-yellow');
                break;
            case 'red':
            case 'danger':
                this.sysAlert.textContent = 'DANGER';
                this.sysAlert.classList.add('alert-red');
                break;
        }
    }
};

// Initialisation dès que le DOM est chargé
document.addEventListener('DOMContentLoaded', () => SystemMonitor.init());