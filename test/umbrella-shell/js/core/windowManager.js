/* ============================================================
   core/windowManager.js — global: WindowManager
   Handles creation, drag, focus, minimize, close of app windows.
   ============================================================ */
window.WindowManager = (function () {
  const { el } = window.DOMUtil;
  const windows = {};       // id -> { node, minimized }
  let zTop = 20;
  let openOffset = 0;

  function desktop() { return document.getElementById('desktop'); }
  function taskbar() { return document.getElementById('taskbar'); }

  function focus(id) {
    Object.values(windows).forEach(w => w.node.classList.remove('focused'));
    const w = windows[id];
    if (!w) return;
    zTop += 1;
    w.node.style.zIndex = zTop;
    w.node.classList.add('focused');
    updateTaskbar();
  }

  function updateTaskbar() {
    const bar = taskbar();
    if (!bar) return;
    bar.innerHTML = '';
    Object.entries(windows).forEach(([id, w]) => {
      const item = el('div', {
        class: 'taskbar-item' + (w.node.classList.contains('focused') ? ' active' : ''),
        onclick: () => {
          if (w.minimized) toggleMinimize(id);
          focus(id);
        }
      }, w.title);
      bar.appendChild(item);
    });
  }

  function toggleMinimize(id) {
    const w = windows[id];
    if (!w) return;
    w.minimized = !w.minimized;
    w.node.classList.toggle('minimized', w.minimized);
    if (!w.minimized) focus(id);
    updateTaskbar();
  }

  function close(id) {
    const w = windows[id];
    if (!w) return;
    w.node.remove();
    delete windows[id];
    updateTaskbar();
    EventBus.emit('window:closed', { id });
  }

  function makeDraggable(node, handle) {
    let dragging = false, ox = 0, oy = 0;
    handle.addEventListener('mousedown', e => {
      if (e.target.closest('.win-btn')) return;
      dragging = true;
      ox = e.clientX - node.offsetLeft;
      oy = e.clientY - node.offsetTop;
      focusFromNode(node);
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      node.style.left = Math.max(0, e.clientX - ox) + 'px';
      node.style.top = Math.max(46, e.clientY - oy) + 'px';
    });
    window.addEventListener('mouseup', () => { dragging = false; });
  }

  function makeResizable(node, handle) {
    let resizing = false, sx = 0, sy = 0, sw = 0, sh = 0;
    handle.addEventListener('mousedown', e => {
      resizing = true; sx = e.clientX; sy = e.clientY;
      sw = node.offsetWidth; sh = node.offsetHeight;
      e.stopPropagation(); e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!resizing) return;
      node.style.width = Math.max(320, sw + (e.clientX - sx)) + 'px';
      node.style.height = Math.max(200, sh + (e.clientY - sy)) + 'px';
    });
    window.addEventListener('mouseup', () => { resizing = false; });
  }

  function focusFromNode(node) {
    const id = node.dataset.winId;
    if (id) focus(id);
  }

  /**
   * open({ id, title, tag, width, height, render(bodyEl) })
   * If a window with `id` already exists, it is focused instead of duplicated.
   */
  function open(opts) {
    if (windows[opts.id]) {
      if (windows[opts.id].minimized) toggleMinimize(opts.id);
      focus(opts.id);
      return windows[opts.id].node;
    }

    openOffset = (openOffset + 30) % 200;
    const node = el('div', {
      class: 'app-window',
      style: `left:${120 + openOffset}px; top:${90 + openOffset}px; width:${opts.width || 420}px; height:${opts.height || 300}px;`
    });
    node.dataset.winId = opts.id;

    const titlebar = el('div', { class: 'win-titlebar' }, [
      el('div', { class: 'win-title-text' }, [
        opts.title,
        opts.tag ? el('span', { class: 'tag' }, opts.tag) : null
      ]),
      el('div', { class: 'win-controls' }, [
        el('div', { class: 'win-btn', onclick: () => toggleMinimize(opts.id) }, '_'),
        el('div', { class: 'win-btn', onclick: () => close(opts.id) }, 'x')
      ])
    ]);

    const body = el('div', { class: 'win-body' });
    const resizeHandle = el('div', { class: 'win-resize-handle' });

    node.appendChild(titlebar);
    node.appendChild(body);
    node.appendChild(resizeHandle);
    node.addEventListener('mousedown', () => focusFromNode(node));

    desktop().appendChild(node);
    windows[opts.id] = { node, title: opts.title, minimized: false };

    makeDraggable(node, titlebar);
    makeResizable(node, resizeHandle);

    if (typeof opts.render === 'function') opts.render(body, node);

    focus(opts.id);
    updateTaskbar();
    return node;
  }

  function list() { return Object.keys(windows); }

  return { open, close, focus, toggleMinimize, list };
})();
