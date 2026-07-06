/* ============================================================
   main.js — entry point. Wires core commands + boots the shell.
   Apps self-register their own commands on load (see js/apps/*).
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

  CommandRegistry.register('windows', 'liste les fenetres ouvertes', (args, term) => {
    const w = WindowManager.list();
    term.print('res', w.length ? w.join(', ') : 'aucune fenetre ouverte');
  });

  CommandRegistry.register('close', 'ferme une fenetre: close <id>', (args, term) => {
    if (!args[0]) return term.print('err', 'usage : close <id>');
    WindowManager.close(args[0]);
    term.print('ok', 'fenetre fermee : ' + args[0]);
  });

  CommandRegistry.register('open', 'ouvre une app: open <database|personnel|camera|security|archive|allessa>', (args, term) => {
    const target = (args[0] || '').toLowerCase();
    const map = {
      database: AppDatabase, personnel: AppPersonnel, camera: AppCamera,
      security: AppSecurity, archive: AppArchive, allessa: AppAllessa
    };
    if (!map[target]) return term.print('err', 'application inconnue : ' + target);
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
      { t: 'sys', v: '> UMBRELLA SHELL v1.0 — INITIALISATION' },
      { t: 'sys', v: '> CONNEXION ETABLIE — ' + new Date().toLocaleString('fr-FR') },
      { t: 'sys', v: '> Tapez "help" pour la liste des commandes.' },
      { t: 'sys', v: '─────────────────────────────────────────' }
    ]);
  }

  /* ---------- topbar clock ---------- */
  function initClock() {
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    const uptimeEl = document.getElementById('uptime');
    const bootTime = Date.now();

    function tick() {
      const now = new Date();
      clockEl.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
      dateEl.textContent = now.toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      const diff = Math.floor((Date.now() - bootTime) / 1000);
      uptimeEl.textContent = pad(Math.floor(diff / 3600)) + ':' + pad(Math.floor((diff % 3600) / 60)) + ':' + pad(diff % 60);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- dock buttons ---------- */
  function initDock() {
    document.querySelectorAll('[data-open]').forEach(btn => {
      btn.addEventListener('click', () => CommandParser.run('open ' + btn.dataset.open, Terminal));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    boot();
    initClock();
    initDock();
  });
})();
