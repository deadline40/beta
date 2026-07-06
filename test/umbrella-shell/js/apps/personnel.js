/* ============================================================
   apps/personnel.js — global: AppPersonnel
   Lists personnel dossiers, supports live fuzzy search.
   ============================================================ */
window.AppPersonnel = (function () {
  const { el, clear } = window.DOMUtil;
  let listEl;

  function statusColor(status) {
    if (status === 'PORTE DISPARU') return 'var(--red)';
    if (status === 'CONGE') return 'var(--amber)';
    return 'var(--ok)';
  }

  function renderList(query) {
    clear(listEl);
    const results = FuzzySearch.search(PersonnelData, query, ['name', 'role', 'id']);
    if (!results.length) {
      listEl.appendChild(el('div', { class: 'd-meta' }, 'Aucun dossier correspondant.'));
      return;
    }
    results.forEach(p => {
      listEl.appendChild(el('div', { class: 'dossier-item' }, [
        el('img', { src: p.photo, alt: p.name }),
        el('div', { style: 'flex:1;' }, [
          el('div', { class: 'd-name' }, `${p.name} `, ),
          el('div', { class: 'd-meta' }, `${p.id} — ${p.role} — ${p.clearance}`)
        ]),
        el('div', { style: `font-size:0.62rem; color:${statusColor(p.status)}; letter-spacing:1px;` }, p.status)
      ]));
    });
  }

  function render(body) {
    const search = el('input', {
      placeholder: 'rechercher un dossier...',
      style: 'width:100%; padding:6px 8px; border:1px solid var(--panel-edge); background:rgba(255,255,255,0.02); margin-bottom:10px; font-size:0.72rem;',
      oninput: e => renderList(e.target.value)
    });
    listEl = el('div', { class: 'dossier-list' });
    body.appendChild(search);
    body.appendChild(listEl);
    renderList('');
  }

  function open(query) {
    WindowManager.open({
      id: 'personnel', title: 'PERSONNEL', tag: 'HR.DB', width: 420, height: 360,
      render
    });
    if (query) setTimeout(() => renderList(query), 0);
  }

  CommandRegistry.register('personnel', 'ouvre le registre du personnel', () => open());
  CommandRegistry.register('search', 'recherche un dossier: search "nom"', (args, term) => {
    const q = args.join(' ');
    open(q);
    term.print('ok', `recherche : "${q}"`);
  });

  return { open };
})();
