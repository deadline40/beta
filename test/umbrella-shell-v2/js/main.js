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

  document.addEventListener('DOMContentLoaded', () => {
    boot();
    initClock();
  });
})();
