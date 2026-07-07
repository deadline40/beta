/* ============================================================
   apps/database.js — global: AppDatabase
   Generic record browser combining personnel + archive counts.
   ============================================================ */
window.AppDatabase = (function () {
  const { el } = window.DOMUtil;

  function render(body) {
    const tables = [
      { name: 'PERSONNEL', count: PersonnelData.length, cmd: 'open personnel' },
      { name: 'ARCHIVES', count: ArchiveData.length, cmd: 'open archive' },
      { name: 'SECURITE / LOGS', count: SecurityData.length, cmd: 'open security' },
      { name: 'CAMERAS', count: 6, cmd: 'open camera' }
    ];

    body.appendChild(el('div', { style: 'margin-bottom:10px; color:var(--amber); font-size:0.68rem; letter-spacing:1px;' },
      '> UMBRELLA CENTRAL DATABASE — acces autorise'));

    tables.forEach(t => {
      body.appendChild(el('div', { class: 'dossier-item', style: 'cursor:pointer;', onclick: () => CommandParser.run(t.cmd, Terminal) }, [
        el('div', { class: 'd-name', style: 'flex:1;' }, t.name),
        el('div', { class: 'd-meta' }, t.count + ' entrees')
      ]));
    });
  }

  function open() {
    WindowManager.open({
      id: 'database', title: 'DATABASE', tag: 'DB.SYS', width: 380, height: 300,
      render
    });
  }

  CommandRegistry.register('database', 'ouvre la base de donnees centrale', () => open());

  return { open };
})();
