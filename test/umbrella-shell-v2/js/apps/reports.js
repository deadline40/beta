/* ============================================================
   apps/reports.js — global: AppReports
   Umbrella Reports system - integrated archive management
   Accessible via "open reports" or "open bio-archives"
   ============================================================ */
window.AppReports = (function () {
  const { el } = window.DOMUtil;

  function open() {
    // Open the reports.html in a new window/tab
    window.open('reports.html', '_blank', 'width=1200,height=800,menubar=yes,toolbar=yes,scrollbars=yes');
  }

  function openEmbedded() {
    // Alternative: open in terminal window (inline view)
    WindowManager.open({
      id: 'reports', title: 'RAPPORTS', tag: 'RPT.DB', width: 900, height: 600,
      render: (body) => {
        body.appendChild(el('div', { style: 'margin-bottom:10px; color:var(--amber); font-size:0.68rem; letter-spacing:1px;' },
          '> UMBRELLA REPORTS SYSTEM — ARCHIVES DE RAPPORTS'));
        
        body.appendChild(el('div', { style: 'color:var(--ok); font-size:0.75rem; line-height:1.6;' }, [
          el('p', {}, 'Cette application a ete remplacee par un systeme complet et autonome.'),
          el('p', {}, 'Une nouvelle fenetre va s\'ouvrir avec l\'interface de gestion des rapports.'),
          el('p', {}, ''),
          el('strong', { style: 'color:var(--amber);' }, 'Fonctionnalites:'),
          el('ul', {}, [
            el('li', {}, 'Creer, modifier et supprimer des rapports'),
            el('li', {}, 'Classer par tags (PUBLIC, INTERNE, CONFIDENTIEL, URGENT)'),
            el('li', {}, 'Attacher des images, videos et fichiers audio'),
            el('li', {}, 'Recherche et filtrage'),
            el('li', {}, 'Stockage local dans le navigateur (localStorage)')
          ])
        ]));

        body.appendChild(el('div', { style: 'margin-top:20px;' }, [
          el('button', {
            style: 'background:rgba(0,255,0,0.1); border:1px solid var(--ok); color:var(--ok); padding:8px 16px; cursor:pointer; font-family:var(--font-mono); font-size:0.75rem; letter-spacing:1px;',
            onclick: open
          }, '> OUVRIR INTERFACE COMPLETE')
        ]));
      }
    });
    setTimeout(open, 500); // Auto-open the full interface
  }

  CommandRegistry.register('reports', 'ouvre le systeme de gestion des rapports', () => openEmbedded());
  CommandRegistry.register('bio-archives', 'alias pour rapports (ancienne denomination)', () => openEmbedded());
  CommandRegistry.register('archive', 'alias pour rapports', () => openEmbedded());

  return { open, openEmbedded };
})();
