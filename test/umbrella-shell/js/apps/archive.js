/* ============================================================
   apps/archive.js — global: AppArchive
   Browsable archive of documents / images / videos.
   Clicking an image or video item opens a preview sub-window.
   ============================================================ */
window.AppArchive = (function () {
  const { el } = window.DOMUtil;

  function iconFor(type) {
    if (type === 'video') return '▶';
    if (type === 'image') return '▣';
    return '▤';
  }

  function preview(item) {
    WindowManager.open({
      id: 'preview-' + item.id,
      title: item.name,
      tag: 'PREVIEW',
      width: 420, height: 320,
      render: (body) => {
        if (item.type === 'video') {
          body.appendChild(el('video', { src: item.src, controls: '', style: 'width:100%; filter: grayscale(0.3);' }));
        } else if (item.type === 'image') {
          body.appendChild(el('img', { src: item.src, style: 'width:100%; filter: grayscale(0.3) contrast(1.1);' }));
        } else {
          body.appendChild(el('div', { class: 'd-meta' }, 'Fichier document — apercu indisponible en mode terminal.'));
        }
      }
    });
  }

  function render(body) {
    body.appendChild(el('div', { style: 'margin-bottom:8px; color:var(--amber); font-size:0.66rem; letter-spacing:1px;' },
      '> ARCHIVES — ' + ArchiveData.length + ' fichiers'));

    ArchiveData.forEach(a => {
      body.appendChild(el('div', {
        class: 'dossier-item',
        style: (a.type !== 'document') ? 'cursor:pointer;' : '',
        onclick: () => { if (a.type !== 'document') preview(a); }
      }, [
        el('div', { style: 'width:24px; text-align:center; color:var(--red); font-size:0.9rem;' }, iconFor(a.type)),
        el('div', { style: 'flex:1;' }, [
          el('div', { class: 'd-name' }, a.name),
          el('div', { class: 'd-meta' }, `${a.id} — ${a.size} — ${a.date}`)
        ])
      ]));
    });
  }

  function open() {
    WindowManager.open({
      id: 'archive', title: 'ARCHIVES', tag: 'ARC.SYS', width: 440, height: 380,
      render
    });
  }

  CommandRegistry.register('archive', 'ouvre les archives (documents / images / videos)', () => open());

  return { open };
})();
