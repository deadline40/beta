// js/core/hologram.js
// Umbrella Corp — Holographic Bio-Specimen Renderer
// Animated wireframe body → infected creature with scan lines, glitch, biodata HUD

const UmbrellaHologram = (() => {

  // ── CONFIG ──────────────────────────────────────────────────────────────
  const CFG = {
    humanColor:    '#00ffcc',
    infectedColor: '#ff3333',
    glowHuman:     'rgba(0,255,204,',
    glowInfected:  'rgba(255,51,51,',
    scanColor:     'rgba(0,255,204,0.10)',
    scanColorInf:  'rgba(255,51,51,0.12)',
    bgGlow:        'rgba(0,255,204,0.04)',
    bgGlowInf:     'rgba(255,51,51,0.07)',
  };

  // ── STATE ────────────────────────────────────────────────────────────────
  let canvas, ctx;
  let t = 0;
  let mode = 0;           // 0 = humain, 1 = transition, 2 = créature
  let modeTimer = 0;
  let glitchOn = false;
  let glitchTimer = 0;
  let scanY = 0;
  let infectionLevel = 0; // 0..1
  let dnaOffset = 0;

  // Bio-données affichées en HUD
  const BIODATA_HUMAN = [
    'SPECIMEN: HUMAN / MALE',
    'HEIGHT: 183 cm',
    'WEIGHT: 78.4 kg',
    'HEART RATE: 72 BPM',
    'BLOOD TYPE: A+',
    'DNA INTEGRITY: 100%',
    'VIRAL LOAD: 0.000%',
    'STATUS: HEALTHY',
  ];

  const BIODATA_INFECTED = [
    'SPECIMEN: T-VIRUS / STAGE 4',
    'HEIGHT: 198 cm [MUTATED]',
    'WEIGHT: 142 kg [MASS GAIN]',
    'HEART RATE: --  [ABSENT]',
    'BLOOD TYPE: [CORRUPTED]',
    'DNA INTEGRITY: 7.3%',
    'VIRAL LOAD: 99.97%',
    'STATUS: !! DANGER !!',
  ];

  // ── HELPERS ──────────────────────────────────────────────────────────────
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function glowLine(x1, y1, x2, y2, col, blur, w) {
    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur = blur;
    ctx.strokeStyle = col;
    ctx.lineWidth = w || 1.2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.restore();
  }

  function glowCircle(x, y, r, col, blur, fill) {
    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur = blur;
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.stroke();
    ctx.restore();
  }

  function glowText(text, x, y, col, size, blur, align) {
    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur = blur || 8;
    ctx.fillStyle = col;
    ctx.font = `${size || 9}px 'Courier New', monospace`;
    ctx.textAlign = align || 'left';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // ── CORPS HUMAIN WIREFRAME ────────────────────────────────────────────────
  // ox,oy = centre bas du torse, sc = échelle
  function drawHumanBody(ox, oy, sc, col, alpha, inf) {
    ctx.globalAlpha = alpha;
    const glow = inf > 0.5 ? CFG.glowInfected : CFG.glowHuman;
    const blur = 10 + inf * 14;

    // Légère oscillation respiratoire
    const breathe = Math.sin(t * 0.04) * 2 * (1 - inf * 0.7);

    // Distorsion créature
    const distort = inf > 0 ? (Math.random() - 0.5) * inf * 3 : 0;
    const bulge   = inf * 18; // gonflement des épaules/torse

    // ── CRÂNE / TÊTE ──
    const headY  = oy - sc * 1.82 + breathe;
    const headR  = sc * 0.22 + inf * sc * 0.09;
    const headX  = ox + distort;
    glowCircle(headX, headY, headR, col, blur);

    // Yeux (rougeoyants si infecté)
    if (inf > 0.3) {
      const eyeCol = `rgba(255,${Math.floor(lerp(200,0,inf))},0,${0.5+inf*0.5})`;
      glowCircle(headX - headR * 0.32, headY - headR * 0.1, 3 + inf * 3, eyeCol, 14, eyeCol);
      glowCircle(headX + headR * 0.32, headY - headR * 0.1, 3 + inf * 3, eyeCol, 14, eyeCol);
    }

    // Grille de scan sur la tête
    ctx.save();
    ctx.strokeStyle = col; ctx.lineWidth = 0.4; ctx.globalAlpha = alpha * 0.25;
    for (let i = -1; i <= 1; i++) {
      const gy = headY + i * headR * 0.45;
      const gw = Math.sqrt(Math.max(0, headR * headR - (i * headR * 0.45) ** 2));
      ctx.beginPath(); ctx.moveTo(headX - gw, gy); ctx.lineTo(headX + gw, gy); ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = alpha;

    // ── COU ──
    const neckT = headY + headR;
    const neckB = oy - sc * 1.45 + breathe * 0.5;
    glowLine(headX, neckT, headX, neckB, col, blur, 1.5 + inf);

    // ── ÉPAULES ──
    const shY   = neckB + sc * 0.08;
    const shW   = sc * 0.52 + bulge * 0.7;
    const lShX  = ox - shW + distort * 0.5;
    const rShX  = ox + shW + distort * 0.5;
    glowLine(lShX, shY, rShX, shY, col, blur, 1.5 + inf);

    // Clavicules
    glowLine(headX, neckB, lShX, shY, col, blur * 0.7, 1);
    glowLine(headX, neckB, rShX, shY, col, blur * 0.7, 1);

    // ── BRAS GAUCHE ──
    const lElbY = shY + sc * 0.45;
    const lElbX = lShX - sc * 0.12 - inf * 8 + distort;
    const lWrY  = lElbY + sc * 0.42;
    const lWrX  = lElbX - sc * 0.05 - inf * 6;
    glowLine(lShX, shY, lElbX, lElbY, col, blur, 1.5);
    glowLine(lElbX, lElbY, lWrX, lWrY, col, blur, 1.5);
    glowCircle(lElbX, lElbY, 3 + inf, col, blur);
    // Main
    if (inf < 0.6) {
      glowLine(lWrX - 4, lWrY + 5, lWrX, lWrY, col, blur, 1);
      glowLine(lWrX - 1, lWrY + 6, lWrX, lWrY, col, blur, 1);
      glowLine(lWrX + 3, lWrY + 6, lWrX, lWrY, col, blur, 1);
      glowLine(lWrX + 6, lWrY + 4, lWrX, lWrY, col, blur, 1);
    } else {
      // Griffes
      for (let f = 0; f < 4; f++) {
        glowLine(lWrX + (f-1.5)*5, lWrY, lWrX + (f-1.5)*8, lWrY + 14 + f*2, '#ff3333', 12, 1.5);
      }
    }

    // ── BRAS DROIT ──
    const rElbY = shY + sc * 0.45 + inf * 5;
    const rElbX = rShX + sc * 0.14 + inf * 10 + distort;
    const rWrY  = rElbY + sc * 0.42;
    const rWrX  = rElbX + sc * 0.05 + inf * 7;
    glowLine(rShX, shY, rElbX, rElbY, col, blur, 1.5);
    glowLine(rElbX, rElbY, rWrX, rWrY, col, blur, 1.5);
    glowCircle(rElbX, rElbY, 3 + inf, col, blur);
    if (inf < 0.6) {
      glowLine(rWrX - 4, rWrY + 5, rWrX, rWrY, col, blur, 1);
      glowLine(rWrX - 1, rWrY + 6, rWrX, rWrY, col, blur, 1);
      glowLine(rWrX + 3, rWrY + 6, rWrX, rWrY, col, blur, 1);
      glowLine(rWrX + 6, rWrY + 4, rWrX, rWrY, col, blur, 1);
    } else {
      for (let f = 0; f < 5; f++) {
        glowLine(rWrX + (f-2)*5, rWrY, rWrX + (f-2)*9, rWrY + 16 + f*3, '#ff3333', 14, 2);
      }
    }

    // ── TORSE ──
    const torsoT = shY;
    const torsoB = oy - sc * 0.25 + breathe * 0.3;
    const torsoW = sc * 0.34 + bulge * 0.5;
    // Côtés du torse
    glowLine(lShX, torsoT, ox - torsoW + distort, torsoB, col, blur, 1.5);
    glowLine(rShX, torsoT, ox + torsoW + distort, torsoB, col, blur, 1.5);
    // Bas du torse
    glowLine(ox - torsoW + distort, torsoB, ox + torsoW + distort, torsoB, col, blur, 1.5);

    // Côtes / lignes internes (anatomie)
    ctx.globalAlpha = alpha * 0.35;
    const ribCount = inf < 0.7 ? 4 : 5;
    for (let r = 0; r < ribCount; r++) {
      const ribY  = torsoT + (torsoB - torsoT) * ((r + 1) / (ribCount + 1));
      const ribW2 = lerp(shW * 0.95, torsoW * 0.95, (r + 1) / (ribCount + 1));
      ctx.save();
      ctx.strokeStyle = col; ctx.lineWidth = 0.8; ctx.shadowColor = col; ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(ox - ribW2, ribY);
      ctx.quadraticCurveTo(ox, ribY - (inf < 0.5 ? 6 : -4), ox + ribW2, ribY);
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = alpha;

    // Colonne vertébrale
    const spineX = ox + distort * 0.4;
    glowLine(spineX, neckB, spineX, torsoB, col, blur * 0.6, 0.8);

    // ── BASSIN ──
    const pelY = torsoB + sc * 0.12;
    const pelW = sc * 0.28 + bulge * 0.3;
    glowLine(ox - pelW + distort, pelY, ox + pelW + distort, pelY, col, blur, 1.5);
    glowLine(ox - torsoW + distort, torsoB, ox - pelW + distort, pelY, col, blur, 1);
    glowLine(ox + torsoW + distort, torsoB, ox + pelW + distort, pelY, col, blur, 1);

    // ── JAMBE GAUCHE ──
    const lHipX = ox - pelW * 0.75 + distort;
    const lHipY = pelY;
    const lKneeY = pelY + sc * 0.55;
    const lKneeX = lHipX - inf * 6 + distort * 0.5;
    const lAnkY  = lKneeY + sc * 0.52;
    const lAnkX  = lKneeX + inf * 4;
    glowLine(lHipX, lHipY, lKneeX, lKneeY, col, blur, 1.8);
    glowLine(lKneeX, lKneeY, lAnkX, lAnkY, col, blur, 1.8);
    glowCircle(lKneeX, lKneeY, 4 + inf, col, blur);
    // Pied
    glowLine(lAnkX - 6, lAnkY + 8, lAnkX, lAnkY, col, blur, 1.2);
    glowLine(lAnkX - 6, lAnkY + 8, lAnkX + (inf < 0.5 ? 10 : 16), lAnkY + 8, col, blur, 1.2);

    // ── JAMBE DROITE ──
    const rHipX = ox + pelW * 0.75 + distort;
    const rHipY = pelY;
    const rKneeY = pelY + sc * 0.55 + inf * 4;
    const rKneeX = rHipX + inf * 8 + distort * 0.5;
    const rAnkY  = rKneeY + sc * 0.52;
    const rAnkX  = rKneeX - inf * 3;
    glowLine(rHipX, rHipY, rKneeX, rKneeY, col, blur, 1.8);
    glowLine(rKneeX, rKneeY, rAnkX, rAnkY, col, blur, 1.8);
    glowCircle(rKneeX, rKneeY, 4 + inf, col, blur);
    glowLine(rAnkX + 6, rAnkY + 8, rAnkX, rAnkY, col, blur, 1.2);
    glowLine(rAnkX + 6, rAnkY + 8, rAnkX - (inf < 0.5 ? 10 : 16), rAnkY + 8, col, blur, 1.2);

    // ── MUTATIONS si infecté ──
    if (inf > 0.5) {
      // Tumeurs / excroissances
      const growths = [
        { x: rShX + 10, y: shY - 10, r: 6 + inf * 8 },
        { x: lShX - 8,  y: shY + 20, r: 4 + inf * 6 },
        { x: ox + 20,   y: torsoT + 40, r: 5 + inf * 7 },
        { x: rKneeX + 12, y: rKneeY, r: 4 + inf * 5 },
      ];
      for (const g of growths) {
        const gr = g.r * (0.8 + Math.sin(t * 0.07 + g.x) * 0.2);
        ctx.save();
        ctx.strokeStyle = CFG.infectedColor; ctx.lineWidth = 1;
        ctx.shadowColor = CFG.infectedColor; ctx.shadowBlur = 16;
        ctx.globalAlpha = alpha * (0.4 + inf * 0.4);
        ctx.beginPath(); ctx.arc(g.x, g.y, gr, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = alpha * (0.1 + inf * 0.15);
        ctx.fillStyle = CFG.infectedColor;
        ctx.fill();
        ctx.restore();
      }

      // Tentacule / queue
      if (inf > 0.75) {
        ctx.save();
        ctx.strokeStyle = '#ff3333'; ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ff3333'; ctx.shadowBlur = 18;
        ctx.globalAlpha = alpha * (inf - 0.75) * 4;
        ctx.beginPath();
        ctx.moveTo(ox, torsoB);
        ctx.bezierCurveTo(
          ox + 60 + Math.sin(t * 0.06) * 20, torsoB + 30,
          ox + 40 + Math.sin(t * 0.09) * 25, torsoB + 70,
          ox + 20 + Math.sin(t * 0.12) * 30, torsoB + 100
        );
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.globalAlpha = 1;
  }

  // ── DOUBLE HÉLICE ADN ────────────────────────────────────────────────────
  function drawDNA(cx, startY, height, col1, col2) {
    const step = 8;
    const amp  = 16;
    dnaOffset += 0.04;

    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.45;

    for (let y = startY; y < startY + height; y += step) {
      const phase = (y - startY) / height * Math.PI * 4 + dnaOffset;
      const x1 = cx + Math.cos(phase) * amp;
      const x2 = cx + Math.cos(phase + Math.PI) * amp;
      const y2 = y + step;
      const phase2 = phase + Math.PI / height * step * 4;

      // Brin 1
      ctx.strokeStyle = col1; ctx.shadowColor = col1; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(cx + Math.cos(phase2) * amp, y2); ctx.stroke();
      // Brin 2
      ctx.strokeStyle = col2; ctx.shadowColor = col2; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.moveTo(x2, y); ctx.lineTo(cx + Math.cos(phase2 + Math.PI) * amp, y2); ctx.stroke();
      // Pont
      if (Math.floor((y - startY) / step) % 3 === 0) {
        ctx.strokeStyle = `rgba(255,255,255,0.2)`;
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ── ANNEAUX ROTATIFS ─────────────────────────────────────────────────────
  function drawRings(cx, cy, col) {
    const radii = [90, 115, 140];
    const speeds = [0.008, -0.005, 0.003];

    for (let i = 0; i < radii.length; i++) {
      const angle = t * speeds[i];
      const r = radii[i];
      ctx.save();
      ctx.strokeStyle = col; ctx.lineWidth = 0.7;
      ctx.shadowColor = col; ctx.shadowBlur = 8;
      ctx.globalAlpha = 0.22 - i * 0.04;

      // Dashes
      ctx.setLineDash([8, 16]);
      ctx.lineDashOffset = -angle * r;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);

      // Nœud tournant
      const nx = cx + Math.cos(angle) * r;
      const ny = cy + Math.sin(angle) * r;
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(nx, ny, 3, 0, Math.PI * 2); ctx.fill();

      // Label sur le nœud
      if (i === 0) {
        glowText(`${(angle * 57.3 % 360).toFixed(0)}°`, nx + 6, ny - 4, col, 7, 6);
      }
      ctx.restore();
    }
  }

  // ── LIGNE DE SCAN ────────────────────────────────────────────────────────
  function drawScanLine(w, h, col) {
    scanY += 1.8;
    if (scanY > h) scanY = 0;

    const grad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, col);
    grad.addColorStop(1, 'transparent');

    ctx.save();
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.07;
    ctx.fillRect(0, scanY - 30, w, 60);

    ctx.strokeStyle = col;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35;
    ctx.shadowColor = col;
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(w, scanY); ctx.stroke();
    ctx.restore();
  }

  // ── HUD DONNÉES BIO ───────────────────────────────────────────────────────
  function drawBioHUD(w, h, col, inf) {
    const data = inf < 0.5 ? BIODATA_HUMAN : BIODATA_INFECTED;
    const iCol = inf > 0 ? `rgba(255,${Math.floor(lerp(200, 0, inf))},0,${0.4 + inf * 0.5})` : col;

    // Panneau gauche
    const lx = 12;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(lx - 2, h * 0.1, 160, data.length * 14 + 18);
    ctx.strokeStyle = col; ctx.lineWidth = 0.5; ctx.shadowColor = col; ctx.shadowBlur = 4;
    ctx.globalAlpha = 0.4;
    ctx.strokeRect(lx - 2, h * 0.1, 160, data.length * 14 + 18);
    ctx.restore();

    glowText('[ BIO-SCAN DATA ]', lx + 2, h * 0.1 + 12, col, 9, 10);
    for (let i = 0; i < data.length; i++) {
      const lineCol = (data[i].includes('DANGER') || data[i].includes('CORRUPTED')) ? '#ff0000'
                    : (data[i].includes('MUTATION') || data[i].includes('MUTATED')) ? '#ff6600'
                    : (i === data.length - 1 && inf > 0.5) ? iCol : col;
      const flash = data[i].includes('DANGER') ? (Math.sin(t * 0.15) > 0 ? 1 : 0) : 1;
      if (flash) glowText(data[i], lx + 2, h * 0.1 + 26 + i * 14, lineCol, 8, 8);
    }

    // Panneau droit — vitaux graphiques
    const rx = w - 170;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(rx, h * 0.1, 155, 90);
    ctx.strokeStyle = col; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.4;
    ctx.strokeRect(rx, h * 0.1, 155, 90);
    ctx.restore();

    glowText('[ VITAL SIGNS ]', rx + 4, h * 0.1 + 12, col, 9, 10);

    // Ligne de pouls simulée
    ctx.save();
    ctx.strokeStyle = inf < 0.5 ? '#00ff88' : '#ff3333';
    ctx.lineWidth = 1.2;
    ctx.shadowColor = inf < 0.5 ? '#00ff88' : '#ff3333';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    const pulseX0 = rx + 8;
    const pulseY0 = h * 0.1 + 38;
    const pW = 140;
    ctx.moveTo(pulseX0, pulseY0);
    for (let px = 0; px < pW; px++) {
      const phase = (px / pW * Math.PI * 8) + t * (inf < 0.5 ? 0.12 : 0.05);
      let py;
      if (inf < 0.5) {
        // Pouls normal
        py = pulseY0 + Math.sin(phase) * 10 * Math.exp(-((px % (pW/4) - pW/8)**2) / 60);
      } else {
        // Pouls erratique
        py = pulseY0 + (Math.sin(phase * 0.7) * 6 + Math.sin(phase * 3.3) * 4 + (Math.random() - 0.5) * inf * 8);
      }
      ctx.lineTo(pulseX0 + px, py);
    }
    ctx.stroke();
    ctx.restore();

    // Barre infection
    const bx = rx + 4;
    const by = h * 0.1 + 58;
    glowText('VIRAL LOAD:', bx, by, col, 8, 6);
    ctx.save();
    ctx.fillStyle = '#111';
    ctx.fillRect(bx, by + 4, 148, 8);
    const barGrad = ctx.createLinearGradient(bx, by + 4, bx + 148, by + 4);
    barGrad.addColorStop(0, '#00ff88');
    barGrad.addColorStop(0.4, '#ffaa00');
    barGrad.addColorStop(1, '#ff0000');
    ctx.fillStyle = barGrad;
    ctx.shadowColor = inf < 0.3 ? '#00ff88' : '#ff3333';
    ctx.shadowBlur = 10;
    ctx.fillRect(bx, by + 4, 148 * infectionLevel, 8);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 0.5;
    ctx.strokeRect(bx, by + 4, 148, 8);
    ctx.restore();
    glowText(`${(infectionLevel * 100).toFixed(1)}%`, bx + 150, by + 11, inf > 0.5 ? '#ff3333' : '#00ff88', 8, 8);

    // Angle de scan / rotation
    const stY = h * 0.1 + 80;
    glowText(`DNA MATCH: ${(100 - infectionLevel * 92.7).toFixed(1)}%`, rx + 4, stY, col, 8, 6);

    // Coins HUD
    const corners = [[4,4],[w-4,4],[4,h-4],[w-4,h-4]];
    const signs   = [[1,1],[-1,1],[1,-1],[-1,-1]];
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.globalAlpha = 0.4; ctx.shadowColor = col; ctx.shadowBlur = 6;
    for (let i = 0; i < 4; i++) {
      const [cx2, cy2] = corners[i]; const [sx, sy] = signs[i];
      ctx.beginPath();
      ctx.moveTo(cx2 + sx * 18, cy2); ctx.lineTo(cx2, cy2); ctx.lineTo(cx2, cy2 + sy * 18);
      ctx.stroke();
    }
    ctx.restore();

    // Label SPECIMEN en bas
    const specLabel = inf < 0.3 ? 'SPECIMEN: HOMO SAPIENS' : inf < 0.7 ? 'SPECIMEN: T-VIRUS CARRIER' : 'SPECIMEN: B.O.W. CLASS-A [TYRANT]';
    const sCol = inf < 0.3 ? col : inf < 0.7 ? '#ffaa00' : '#ff0000';
    glowText(specLabel, w / 2, h - 12, sCol, 9, 12, 'center');
    // Flash danger
    if (inf > 0.7 && Math.sin(t * 0.18) > 0.3) {
      glowText('⚠ B.O.W. CONTAINMENT PROTOCOL ACTIVE ⚠', w / 2, h - 24, '#ff0000', 8, 16, 'center');
    }
  }

  // ── EFFET GLITCH ─────────────────────────────────────────────────────────
  function applyGlitch(w, h) {
    if (!glitchOn) return;
    const slices = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < slices; i++) {
      const sy = Math.random() * h;
      const sh = 2 + Math.random() * 18;
      const dx = (Math.random() - 0.5) * 30;
      try {
        const img = ctx.getImageData(0, sy, w, sh);
        ctx.putImageData(img, dx, sy);
      } catch(e) {}
    }
    // Ligne rouge/bleue
    ctx.save();
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255,0,0,0.4)' : 'rgba(0,200,255,0.3)';
    ctx.lineWidth = 1;
    const gy = Math.random() * h;
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    ctx.restore();
  }

  // ── RENDU PRINCIPAL ───────────────────────────────────────────────────────
  function render() {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;

    // Fond
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    // Glow radial de fond selon état
    const bgCol = infectionLevel < 0.5 ? CFG.bgGlow : CFG.bgGlowInf;
    const radGrad = ctx.createRadialGradient(cx, h * 0.4, 20, cx, h * 0.4, 200);
    radGrad.addColorStop(0, bgCol.replace('0.04', (0.04 + infectionLevel * 0.08).toFixed(2)).replace('0.07', '0.10'));
    radGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);

    // Couleur principale
    const col = infectionLevel < 0.5
      ? `rgba(0,${Math.floor(lerp(255, 160, infectionLevel * 2))},${Math.floor(lerp(204, 0, infectionLevel * 2))},0.9)`
      : `rgba(255,${Math.floor(lerp(120, 0, (infectionLevel - 0.5) * 2))},0,0.9)`;

    // ADN à gauche et droite
    drawDNA(cx - 110, h * 0.08, h * 0.84, col, infectionLevel > 0.5 ? '#ff3333' : '#006655');
    drawDNA(cx + 110, h * 0.08, h * 0.84, col, infectionLevel > 0.5 ? '#ff6600' : '#004433');

    // Anneaux
    drawRings(cx, h * 0.38, col);

    // Corps
    const bodyY = h * 0.75;
    const scale = h * 0.30;
    drawHumanBody(cx, bodyY, scale, col, 0.9, infectionLevel);

    // Ligne de scan
    const scanCol = infectionLevel < 0.5 ? CFG.scanColor : CFG.scanColorInf;
    drawScanLine(w, h, col);

    // HUD
    drawBioHUD(w, h, col, infectionLevel);

    // Glitch
    glitchTimer--;
    if (glitchTimer <= 0) {
      glitchOn = Math.random() < (0.15 + infectionLevel * 0.35);
      glitchTimer = Math.floor(3 + Math.random() * 20);
    }
    applyGlitch(w, h);

    // Évolution du mode
    modeTimer++;
    const cycleDur = 220; // frames par phase
    const phase = modeTimer % (cycleDur * 3);
    if (phase < cycleDur) {
      infectionLevel = 0;
    } else if (phase < cycleDur * 2) {
      infectionLevel = clamp((phase - cycleDur) / cycleDur, 0, 1);
    } else {
      infectionLevel = 1;
    }
    // Pulse sur l'infection max
    if (phase >= cycleDur * 2) {
      infectionLevel = 1 + Math.sin(modeTimer * 0.08) * 0.04;
    }

    t++;
  }

  // ── LOOP ANIMATION ────────────────────────────────────────────────────────
  function loop() {
    render();
    requestAnimationFrame(loop);
  }

  // ── INIT ──────────────────────────────────────────────────────────────────
  function init() {
    const container = document.getElementById('hologram-logo');
    if (!container) return;

    // Vider le container (supprime l'ancienne img)
    container.innerHTML = '';

    canvas = document.createElement('canvas');
    canvas.id = 'hologram-canvas';
    canvas.style.cssText = `
      width: 100%;
      height: 100%;
      display: block;
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      mix-blend-mode: screen;
    `;
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = container.clientWidth;
      canvas.height = container.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    loop();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => UmbrellaHologram.init());
