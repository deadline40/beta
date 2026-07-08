/* ============================================================
   main.js — entry point. Wires generic terminal commands + boots
   the shell. Two window systems coexist on purpose:
     - UmbrellaApps (appsManager.js) → sidebar buttons + bare
       commands: personnel / security / database / network / decryptor
     - The classic draggable panels (windowManager.js + js/apps/*)
       → reachable via "open <name>" (database, personnel, camera,
       security, archive, allessa) and "windows" / "close <id>"
   ============================================================ */
(function () {
  const { pad } = window.DOMUtil;

  /* ---------- generic system commands ---------- */
  CommandRegistry.register('help', 'liste les commandes disponibles', (args, term) => {
    const cmds = CommandRegistry.all();
    term.print('res', 'Commandes disponibles :');
    Object.keys(cmds).sort().forEach(name => {
      term.print('res', '  ' + name.padEnd(12) + '— ' + cmds[name].desc);
    });
  });

  CommandRegistry.register('clear', 'efface le terminal', (args, term) => term.clear());

  CommandRegistry.register('whoami', 'identite de session', (args, term) =>
    term.print('res', 'ihonty // acces niveau 5 — session chiffree'));

  CommandRegistry.register('date', 'date et heure systeme', (args, term) =>
    term.print('res', new Date().toLocaleString('fr-FR')));

  /* ---------- classic draggable-window system (additional feature) ---------- */
  CommandRegistry.register('windows', 'liste les fenetres classiques ouvertes (via "open")', (args, term) => {
    const w = WindowManager.list();
    term.print('res', w.length ? w.join(', ') : 'aucune fenetre ouverte');
  });

  CommandRegistry.register('close', 'ferme une fenetre classique: close <id>', (args, term) => {
    if (!args[0]) return term.print('err', 'usage : close <id>');
    WindowManager.close(args[0]);
    term.print('ok', 'fenetre fermee : ' + args[0]);
  });

  CommandRegistry.register('open', 'ouvre une fenetre classique: open <database|personnel|camera|security|archive|allessa>', (args, term) => {
    const target = (args[0] || '').toLowerCase();
    const map = {
      database: window.AppDatabase, personnel: window.AppPersonnel, camera: window.AppCamera,
      security: window.AppSecurity, archive: window.AppArchive, allessa: window.AppAllessa
    };
    if (!map[target]) return term.print('err', 'application inconnue : ' + target + ' (essaie : database, personnel, camera, security, archive, allessa)');
    map[target].open();
    term.print('ok', 'ouverture : ' + target);
  });

  CommandRegistry.register('scan', 'lance un scan systeme', (args, term) => {
    term.print('sys', '> analyse en cours...');
    setTimeout(() => term.print('ok', '> scan termine — 0 menace active, 1 alerte archivee'), 700);
  });

  /* ---------- boot sequence ---------- */
  function boot() {
    Terminal.init();
    Terminal.printLines([
      { t: 'sys', v: '> UMBRELLA MAINFRAME OS — INITIALISATION' },
      { t: 'sys', v: '> CONNEXION ETABLIE — ' + new Date().toLocaleString('fr-FR') },
      { t: 'sys', v: '> Tapez "help" pour la liste des commandes.' },
      { t: 'sys', v: '> Astuce : "personnel/security/database" = panneaux mainframe, "open <nom>" = fenetres classiques.' },
      { t: 'sys', v: '─────────────────────────────────────────' }
    ]);
  }

  /* ---------- sidebar clock (matches #clock / #date in index.html) ---------- */
  function initClock() {
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');

    function tick() {
      const now = new Date();
      if (clockEl) clockEl.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
      if (dateEl) dateEl.textContent = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    tick();
    setInterval(tick, 1000);
  }

  const ArticleReport = (() => {
    const articles = [
      {
        id: 'R-001',
        title: 'Protocole d’implantation bionique — phase 3',
        summary: 'Analyse tactique des derniers retours de terrain, incidents de surcharge et recommandations pour le recalibrage neural.',
        author: 'Dr. A. K. Mercer',
        date: '07.07.2026',
        classification: 'LEVEL 4',
        body: [
          'Le projet de renforcement bionique a produit plusieurs retours de stress maître sur les unités augmentées. Les capteurs périphériques enregistrent des impulsions incohérentes au niveau des interfaces synaptiques.',
          'Une station d’interruption a été déployée pour contenir les véhicules autonomes affectés. La suite de la mission consiste à vérifier l’intégrité du couplage RP-9 entre le cortex artificiel et les modules de locomotion.',
          'Il est recommandé de limiter l’accès des opérateurs non autorisés aux données de calibration et de renforcer la couche cryptographique des sauvegardes de mémoire volatile.'
        ],
        image: 'https://picsum.photos/seed/bioreport/420/240',
        video: 'assets/videos/1105533363-preview.mp4',
        audio: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3'
      },
      {
        id: 'R-002',
        title: 'Incident de confinement — module S-12',
        summary: 'Rapport de l’évasion sensorielle dans le module de stockage des tissus et des implants expérimentaux.',
        author: 'Lt. C. R. Nguyen',
        date: '08.07.2026',
        classification: 'LEVEL 3',
        body: [
          'Le module S-12 a subi une brèche de sécurité suite à un court-circuit interne. Les systèmes de surveillance ont capté une signature biométrique altérée au moment de l’incident.',
          'La procédure d’isolement a été exécutée en 42 secondes. Aucun opérateur n’a été blessé, mais un flux électromagnétique anormal a perturbé le réseau local.',
          'Les données de l’archive montrent une tentative d’accès non autorisé aux profils augmentés stockés sur le serveur central.'
        ],
        image: 'https://picsum.photos/seed/confinement/420/240',
        video: 'assets/videos/3510927063-preview.mp4',
        audio: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3'
      }
    ];

    let currentIndex = 0;

    function renderArticle(index) {
      const article = articles[index] || articles[0];
      const titleEl = document.getElementById('article-title');
      const summaryEl = document.getElementById('article-summary');
      const authorEl = document.getElementById('article-author');
      const dateEl = document.getElementById('article-date');
      const classificationEl = document.getElementById('article-classification');
      const bodyEl = document.getElementById('article-body');
      const imageEl = document.getElementById('article-image');
      const videoEl = document.getElementById('article-video');
      const audioEl = document.getElementById('article-audio');

      if (titleEl) titleEl.textContent = article.title;
      if (summaryEl) summaryEl.textContent = article.summary;
      if (authorEl) authorEl.textContent = article.author;
      if (dateEl) dateEl.textContent = article.date;
      if (classificationEl) classificationEl.textContent = article.classification;

      if (bodyEl) {
        bodyEl.innerHTML = '';
        article.body.forEach(paragraph => {
          const p = document.createElement('p');
          p.textContent = paragraph;
          bodyEl.appendChild(p);
        });
      }
      if (imageEl) imageEl.src = article.image;
      if (videoEl) videoEl.src = article.video;
      if (audioEl) audioEl.src = article.audio;

      const navEl = document.getElementById('article-nav');
      if (navEl) {
        navEl.innerHTML = '';
        articles.forEach((item, idx) => {
          const btn = document.createElement('button');
          btn.textContent = item.id;
          btn.className = idx === currentIndex ? 'active' : '';
          btn.addEventListener('click', () => {
            currentIndex = idx;
            renderArticle(idx);
          });
          navEl.appendChild(btn);
        });
      }
    }

    function init() {
      renderArticle(currentIndex);
    }

    return { init };
  })();

  async function initSidebarArticles() {
    const listEl = document.getElementById('sidebar-articles-list');
    if (!listEl) return;
    try {
      const res = await fetch('/api/articles');
      if (!res.ok) throw new Error('API down');
      const articles = await res.json();
      
      listEl.innerHTML = '';
      if (articles.length === 0) {
        listEl.innerHTML = '<div style="font-size:0.7rem; color:#888;">AUCUNE PUBLICATION.</div>';
        return;
      }
      
      articles.forEach(art => {
        const item = document.createElement('div');
        item.style.border = '1px solid #00aaff33';
        item.style.padding = '6px';
        item.style.background = 'rgba(0,170,255,0.05)';
        item.style.cursor = 'pointer';
        item.style.transition = 'all 0.2s';
        
        item.innerHTML = `
            <div style="font-size:0.75rem; font-weight:bold; color:#00aaff; margin-bottom:2px; line-height:1.2;">${art.title}</div>
            <div style="font-size:0.6rem; color:#888;">${art.clearance} | ${art.created_at.split(' ')[0]}</div>
        `;
        
        item.onmouseenter = () => { item.style.borderColor = '#00aaff'; item.style.background = 'rgba(0,170,255,0.1)'; };
        item.onmouseleave = () => { item.style.borderColor = '#00aaff33'; item.style.background = 'rgba(0,170,255,0.05)'; };
        
        item.onclick = () => {
            // Open full article in classic window popup when clicked
            UmbrellaApps.openWindow('Document: ' + art.title, 
                `<div style="font-size:0.8rem; color:#00aaff; margin-bottom:10px; padding-bottom:5px; border-bottom:1px dashed #00aaff55;">AUTEUR: <span style="color:#ffaa00">${art.author}</span> | CLASSIFICATION: <span style="color:#ffaa00">${art.clearance}</span></div>
                 <div style="font-size:0.8rem; line-height:1.5; color:#ddd; white-space:pre-wrap;">${art.content}</div>`, 
            480, 360);
        };
        listEl.appendChild(item);
      });
    } catch (e) {
      console.error(e);
      listEl.innerHTML = '<div style="font-size:0.7rem; color:#ff3333;">ERREUR CONNEXION SERVEUR.</div>';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    boot();
    initClock();
    ArticleReport.init();
    initSidebarArticles();
  });
})();
