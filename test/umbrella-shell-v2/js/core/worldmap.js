// js/core/worldmap.js
// Umbrella Corp — Geospatial Tracking Module
// Carte du monde 2D (projection Mercator simplifiée) + données de tracking animées

const UmbrellaWorldMap = (() => {

  // ── DONNÉES DES CIBLES UMBRELLA ──────────────────────────────────────────
  const TARGETS = [
    { id: 'TGT-001', name: 'RACCOON CITY',  lat:  41.8,  lon:  -87.6, type: 'LAB',      threat: 'CRITICAL', active: true  },
    { id: 'TGT-002', name: 'PARIS NODE',    lat:  48.85, lon:    2.35, type: 'SERVER',   threat: 'LOW',      active: true  },
    { id: 'TGT-003', name: 'TOKYO HUB',     lat:  35.68, lon:  139.69, type: 'RELAY',    threat: 'MEDIUM',   active: true  },
    { id: 'TGT-004', name: 'ANTARTICA LAB', lat: -77.85, lon:  166.67, type: 'RESEARCH', threat: 'HIGH',     active: false },
    { id: 'TGT-005', name: 'CAIRO OUTPOST', lat:  30.05, lon:   31.25, type: 'OUTPOST',  threat: 'MEDIUM',   active: true  },
    { id: 'TGT-006', name: 'AMAZON BASE',   lat:  -3.10, lon:  -60.02, type: 'LAB',      threat: 'HIGH',     active: true  },
    { id: 'TGT-007', name: 'MOSCOW NODE',   lat:  55.75, lon:   37.62, type: 'SERVER',   threat: 'LOW',      active: true  },
    { id: 'TGT-008', name: 'SYDNEY DEPOT',  lat: -33.87, lon:  151.21, type: 'DEPOT',    threat: 'LOW',      active: false },
    { id: 'TGT-009', name: 'ANTANANARIVO',  lat: -18.91, lon:   47.54, type: 'HQ',       threat: 'NONE',     active: true  },
  ];

  // Vaisseaux / mobiles en transit
  const MOBILES = [
    { id: 'MOB-A', name: 'OSPREY-7',  lat: 20,  lon: -20,  dlat:  0.15, dlon:  0.4,  type: 'AIR',  speed: '620 KN' },
    { id: 'MOB-B', name: 'TRITON-2',  lat: -5,  lon:  80,  dlat: -0.05, dlon:  0.25, type: 'SEA',  speed: '18 KN'  },
    { id: 'MOB-C', name: 'VECTOR-1',  lat: 50,  lon: 100,  dlat:  0.1,  dlon: -0.3,  type: 'AIR',  speed: '480 KN' },
  ];

  // Couleurs par niveau de menace
  const THREAT_COLOR = {
    NONE:     '#00ff88',
    LOW:      '#00aaff',
    MEDIUM:   '#ffaa00',
    HIGH:     '#ff6600',
    CRITICAL: '#ff0000',
  };

  // Polygones continents simplifiés [lon, lat] dans l'ordre de dessin
  // Source : approximation Mercator basse résolution pour canvas
  const CONTINENTS = [
    // Amérique du Nord
    { name: 'NA', pts: [
      [-168,71],[-140,70],[-95,74],[-78,72],[-64,47],[-52,47],[-60,43],[-67,44],[-70,41],
      [-80,31],[-90,28],[-97,25],[-106,22],[-118,22],[-120,31],[-124,37],[-124,48],[-130,54],
      [-140,60],[-152,60],[-158,70],[-168,71]
    ]},
    // Amérique du Sud
    { name: 'SA', pts: [
      [-80,11],[-75,10],[-60,6],[-50,2],[-44,2],[-35,-5],[-35,-12],[-40,-22],[-44,-22],
      [-48,-28],[-53,-33],[-58,-38],[-63,-42],[-66,-55],[-67,-55],[-71,-45],[-75,-37],
      [-70,-30],[-70,-17],[-74,-8],[-77,-2],[-80,0],[-80,11]
    ]},
    // Europe
    { name: 'EU', pts: [
      [-9,35],[2,36],[12,37],[18,39],[23,37],[28,38],[30,41],[36,41],[36,47],[28,50],
      [22,55],[20,60],[25,65],[28,70],[18,70],[14,65],[5,62],[-2,58],[-5,54],[-8,48],
      [-9,43],[-9,35]
    ]},
    // Afrique
    { name: 'AF', pts: [
      [-18,14],[-16,20],[-10,24],[0,28],[10,30],[18,28],[25,30],[32,30],[38,22],[42,12],
      [43,10],[44,2],[42,-2],[40,-10],[35,-20],[32,-25],[28,-30],[18,-34],[15,-30],[12,-24],
      [10,-10],[8,4],[2,6],[-6,4],[-15,10],[-18,14]
    ]},
    // Asie
    { name: 'AS', pts: [
      [28,42],[36,38],[40,36],[44,32],[50,26],[58,22],[60,18],[68,22],[76,30],[84,28],
      [90,22],[100,10],[104,1],[110,-4],[116,4],[120,16],[126,24],[130,32],[136,40],
      [140,45],[140,55],[132,62],[120,70],[100,72],[80,72],[60,70],[52,64],[42,56],
      [36,48],[28,42]
    ]},
    // Australie
    { name: 'AU', pts: [
      [114,-22],[118,-20],[124,-14],[130,-12],[136,-12],[138,-14],[140,-18],[148,-20],
      [154,-26],[152,-32],[148,-38],[142,-38],[136,-36],[130,-32],[122,-32],[114,-26],[114,-22]
    ]},
    // Groenland
    { name: 'GL', pts: [
      [-44,82],[-16,76],[-16,68],[-24,64],[-34,64],[-44,66],[-54,70],[-60,76],[-44,82]
    ]},
  ];

  // ── ÉTAT INTERNE ─────────────────────────────────────────────────────────
  let canvas, ctx, selectedId = 'TGT-001';
  let tick = 0;
  let mobiles = MOBILES.map(m => ({ ...m }));

  // ── UTILITAIRES MERCATOR ─────────────────────────────────────────────────
  const STAR_COUNT = 90;
  const SEA_PARTICLES = 220;
  let starField = [];
  let seaTextureCanvas = null;

  function project(lat, lon, w, h) {
    const x = ((lon + 180) / 360) * w;
    const latRad = lat * Math.PI / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = h / 2 - (mercN / Math.PI) * (h / 2.6);
    return { x, y };
  }

  function ensureBackgroundAssets(w, h) {
    if (!seaTextureCanvas || seaTextureCanvas.width !== w || seaTextureCanvas.height !== h) {
      starField = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.4,
        a: 0.08 + Math.random() * 0.25,
      }));

      seaTextureCanvas = document.createElement('canvas');
      seaTextureCanvas.width = w;
      seaTextureCanvas.height = h;
      const tx = seaTextureCanvas.getContext('2d');
      tx.clearRect(0, 0, w, h);
      tx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let i = 0; i < SEA_PARTICLES; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = 0.8 + Math.random() * 1.4;
        tx.beginPath();
        tx.arc(x, y, size, 0, Math.PI * 2);
        tx.fill();
      }
    }
  }

  function drawStarfield() {
    ctx.save();
    for (const star of starField) {
      ctx.globalAlpha = star.a;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSeaTexture(w, h) {
    if (!seaTextureCanvas) return;
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.drawImage(seaTextureCanvas, 0, 0, w, h);
    ctx.restore();
  }

  function drawMap(w, h) {
    ensureBackgroundAssets(w, h);

    const ocean = ctx.createLinearGradient(0, 0, 0, h);
    ocean.addColorStop(0, '#07121d');
    ocean.addColorStop(0.5, '#05121d');
    ocean.addColorStop(1, '#02060d');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, w, h);

    const glow = ctx.createRadialGradient(w * 0.65, h * 0.3, 20, w * 0.65, h * 0.3, w * 0.9);
    glow.addColorStop(0, 'rgba(0, 170, 255, 0.12)');
    glow.addColorStop(0.7, 'rgba(0, 40, 70, 0.00)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    drawSeaTexture(w, h);
    drawStarfield();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 0.5;
    for (let lon = -180; lon <= 180; lon += 30) {
      const p1 = project(85, lon, w, h);
      const p2 = project(-85, lon, w, h);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const p1 = project(lat, -180, w, h);
      const p2 = project(lat, 180, w, h);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 0.8;
    const eq1 = project(0, -180, w, h);
    const eq2 = project(0, 180, w, h);
    ctx.beginPath();
    ctx.moveTo(eq1.x, eq1.y);
    ctx.lineTo(eq2.x, eq2.y);
    ctx.stroke();

    for (const cont of CONTINENTS) {
      const landShading = ctx.createLinearGradient(0, 0, 0, h);
      landShading.addColorStop(0, '#5a8c63');
      landShading.addColorStop(0.4, '#2f5634');
      landShading.addColorStop(1, '#101e13');

      ctx.fillStyle = landShading;
      ctx.strokeStyle = 'rgba(150, 230, 170, 0.18)';
      ctx.lineWidth = 1;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      cont.pts.forEach(([lon, lat], i) => {
        const p = project(lat, lon, w, h);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      cont.pts.forEach(([lon, lat], i) => {
        const p = project(lat, lon, w, h);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();
    }
  }

  function drawTargets(w, h) {
    const t = Date.now();

    // Lignes de connexion entre cibles actives
    const active = TARGETS.filter(t => t.active);
    ctx.strokeStyle = 'rgba(255,51,51,0.09)';
    ctx.lineWidth = 0.6;
    ctx.setLineDash([3, 6]);
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const pa = project(active[i].lat, active[i].lon, w, h);
        const pb = project(active[j].lat, active[j].lon, w, h);
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // Cibles fixes
    for (const tgt of TARGETS) {
      const p = project(tgt.lat, tgt.lon, w, h);
      const col = THREAT_COLOR[tgt.threat];
      const isSel = tgt.id === selectedId;

      // Halo de sélection
      if (isSel) {
        const r = 16 + Math.sin(t * 0.005) * 4;
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.35;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Ping pulse
      if (tgt.active) {
        const phase = ((t * 0.002) + TARGETS.indexOf(tgt) * 0.7) % 1;
        const pr = phase * 20;
        ctx.strokeStyle = col;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = (1 - phase) * 0.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, pr, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Réticule cible
      const sz = isSel ? 7 : 5;
      ctx.strokeStyle = tgt.active ? col : '#333';
      ctx.lineWidth = isSel ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(p.x - sz, p.y); ctx.lineTo(p.x + sz, p.y);
      ctx.moveTo(p.x, p.y - sz); ctx.lineTo(p.x, p.y + sz);
      ctx.stroke();
      // Coin supérieur gauche
      ctx.beginPath();
      ctx.moveTo(p.x - sz, p.y - sz + 2); ctx.lineTo(p.x - sz, p.y - sz); ctx.lineTo(p.x - sz + 2, p.y - sz);
      ctx.moveTo(p.x + sz - 2, p.y - sz); ctx.lineTo(p.x + sz, p.y - sz); ctx.lineTo(p.x + sz, p.y - sz + 2);
      ctx.stroke();

      // Label
      if (isSel || tgt.threat === 'CRITICAL') {
        ctx.fillStyle = col;
        ctx.font = `bold 8px 'Courier New', monospace`;
        ctx.fillText(tgt.name, p.x + 8, p.y - 4);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = `7px monospace`;
        ctx.fillText(tgt.id, p.x + 8, p.y + 6);
      }
    }
  }

  function drawMobiles(w, h) {
    const t = Date.now();
    for (const mob of mobiles) {
      // Déplacement
      mob.lat += mob.dlat * 0.016;
      mob.lon += mob.dlon * 0.016;
      if (mob.lat > 80)  mob.lat = -80;
      if (mob.lat < -80) mob.lat = 80;
      if (mob.lon > 180) mob.lon = -180;
      if (mob.lon < -180) mob.lon = 180;

      const p = project(mob.lat, mob.lon, w, h);
      const col = mob.type === 'AIR' ? '#00aaff' : '#00ffaa';

      // Traîne
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      const trail = project(mob.lat - mob.dlat * 8, mob.lon - mob.dlon * 8, w, h);
      ctx.beginPath(); ctx.moveTo(trail.x, trail.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Icône mobile
      ctx.fillStyle = col;
      ctx.strokeStyle = col;
      ctx.lineWidth = 1;
      if (mob.type === 'AIR') {
        // Triangle avion
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - 5);
        ctx.lineTo(p.x + 4, p.y + 3);
        ctx.lineTo(p.x - 4, p.y + 3);
        ctx.closePath(); ctx.fill();
      } else {
        // Bateau
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      }

      // Label
      ctx.fillStyle = col;
      ctx.font = `7px monospace`;
      ctx.fillText(mob.name, p.x + 6, p.y - 2);
    }
  }

  function drawHUD(w, h) {
    const now = new Date();

    // Barre de titre HUD
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, 16);
    ctx.fillStyle = '#ff3333';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('● UMBRELLA GEOSPATIAL TRACKING SYSTEM v3.7', 6, 11);
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'right';
    ctx.fillText(now.toLocaleTimeString('fr-FR') + ' UTC+3', w - 6, 11);
    ctx.textAlign = 'left';

    // Barre bas
    const sel = TARGETS.find(t => t.id === selectedId);
    if (sel) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, h - 14, w, 14);
      ctx.fillStyle = THREAT_COLOR[sel.threat];
      ctx.font = '8px monospace';
      ctx.fillText(`◉ ${sel.id} | ${sel.name} | ${sel.type} | THREAT: ${sel.threat} | LAT:${sel.lat.toFixed(2)} LON:${sel.lon.toFixed(2)}`, 6, h - 4);
    }

    // Légende
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(w - 80, 20, 76, 70);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(w - 80, 20, 76, 70);
    let ly = 32;
    ctx.font = 'bold 7px monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('THREAT LEVEL', w - 77, ly); ly += 10;
    for (const [k, v] of Object.entries(THREAT_COLOR)) {
      ctx.fillStyle = v;
      ctx.fillRect(w - 77, ly - 5, 5, 5);
      ctx.fillStyle = '#aaa';
      ctx.font = '7px monospace';
      ctx.fillText(k, w - 70, ly);
      ly += 9;
    }
  }

  // ── BOUCLE PRINCIPALE ────────────────────────────────────────────────────
  function animate() {
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    tick++;
    drawMap(w, h);
    drawTargets(w, h);
    drawMobiles(w, h);
    drawHUD(w, h);
    requestAnimationFrame(animate);
  }

  // ── PANNEAU DE TRACKING SIDEBAR (DOM) ───────────────────────────────────
  let _trackInterval = null;

  function buildTrackingPanel() {
    const container = document.getElementById('geo-track-list');
    if (!container) return;

    function renderList() {
      container.innerHTML = '';
      for (const tgt of TARGETS) {
        const col = THREAT_COLOR[tgt.threat];
        const isSelected = tgt.id === selectedId;
        const div = document.createElement('div');
        div.className = 'track-item' + (isSelected ? ' track-item--selected' : '');
        div.style.borderLeft = `2px solid ${isSelected ? col : '#222'}`;
        div.innerHTML = `
          <div class="track-item-header">
            <span class="track-dot" style="color:${col}">◉</span>
            <span class="track-id">${tgt.id}</span>
            <span class="track-badge" style="color:${col};border-color:${col}">${tgt.threat}</span>
            ${tgt.active ? '<span class="track-live">LIVE</span>' : '<span class="track-offline">OFFLINE</span>'}
          </div>
          <div class="track-name">${tgt.name}</div>
          <div class="track-coords">
            <span>LAT: ${tgt.lat.toFixed(2)}°</span>
            <span>LON: ${tgt.lon.toFixed(2)}°</span>
            <span class="track-type">${tgt.type}</span>
          </div>
        `;
        div.addEventListener('click', () => {
          selectedId = tgt.id;
          renderList();
          updateSummary();
        });
        container.appendChild(div);
      }
    }

    function updateSummary() {
      const el = document.getElementById('geo-track-summary');
      if (!el) return;
      const active = TARGETS.filter(t => t.active).length;
      const critical = TARGETS.filter(t => t.threat === 'CRITICAL').length;
      const high = TARGETS.filter(t => t.threat === 'HIGH').length;
      el.innerHTML = `
        <div class="geo-stat"><span>NODES ACTIFS</span><span class="geo-stat-val text-online">${active}/${TARGETS.length}</span></div>
        <div class="geo-stat"><span>MENACES CRITIQUES</span><span class="geo-stat-val" style="color:#ff0000">${critical}</span></div>
        <div class="geo-stat"><span>MENACES HAUTES</span><span class="geo-stat-val" style="color:#ff6600">${high}</span></div>
        <div class="geo-stat"><span>MOBILES EN TRANSIT</span><span class="geo-stat-val" style="color:#00aaff">${mobiles.length}</span></div>
      `;
    }

    function updateMobilesPanel() {
      const el = document.getElementById('geo-mobiles-list');
      if (!el) return;
      el.innerHTML = mobiles.map(m => `
        <div class="mobile-row">
          <span style="color:${m.type === 'AIR' ? '#00aaff' : '#00ffaa'}">${m.type === 'AIR' ? '✈' : '⛵'}</span>
          <span class="mobile-name">${m.name}</span>
          <span class="mobile-speed">${m.speed}</span>
          <span class="mobile-pos">
            ${m.lat.toFixed(1)}° / ${m.lon.toFixed(1)}°
          </span>
        </div>
      `).join('');
    }

    renderList();
    updateSummary();
    updateMobilesPanel();

    if (_trackInterval) clearInterval(_trackInterval);
    _trackInterval = setInterval(() => {
      updateSummary();
      updateMobilesPanel();
      // Rafraîchit coords des cibles (légère dérive simulée)
      TARGETS.forEach(t => {
        if (t.active) {
          t.lat += (Math.random() - 0.5) * 0.002;
          t.lon += (Math.random() - 0.5) * 0.002;
        }
      });
      renderList();
    }, 3000);
  }

  // ── INIT PUBLIQUE ────────────────────────────────────────────────────────
  function init() {
    canvas = document.getElementById('map-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Taille initiale
    canvas.width  = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    window.addEventListener('resize', () => {
      if (canvas) {
        canvas.width  = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    });

    buildTrackingPanel();
    animate();
  }

  return { init, targets: TARGETS, selectTarget: (id) => { selectedId = id; } };
})();

document.addEventListener('DOMContentLoaded', () => UmbrellaWorldMap.init());
