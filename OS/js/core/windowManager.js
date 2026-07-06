// core/windowManager.js
import { eventBus } from './eventBus.js';

function createWindowManager() {
  let windows = [];      // liste des fenêtres ouvertes : { id, app, element, minimized }
  let zIndexCounter = 10; // pour gérer qui est au-dessus

  function open(appId, appRegistry) {
    // déjà ouverte ? on la focus au lieu d'en recréer une
    const existing = windows.find(w => w.id === appId);
    if (existing) {
      focus(appId);
      return;
    }

    const app = appRegistry[appId];
    if (!app) {
      return `Erreur : app "${appId}" introuvable`;
    }

    const element = buildWindowFrame(app);
    document.getElementById('desktop').appendChild(element);

    const container = element.querySelector('.window-content');
    app.render(container); // on délègue le contenu à l'app, comme prévu dans le contrat

    windows.push({ id: appId, app, element, minimized: false });
    focus(appId);

    return `Fenêtre "${app.title}" ouverte.`;
  }

  function close(appId) {
    const win = windows.find(w => w.id === appId);
    if (!win) return `Aucune fenêtre "${appId}" ouverte.`;

    if (win.app.onClose) win.app.onClose(); // respect du contrat (méthode optionnelle)
    win.element.remove();
    windows = windows.filter(w => w.id !== appId);

    return `Fenêtre "${win.app.title}" fermée.`;
  }

  function focus(appId) {
    const win = windows.find(w => w.id === appId);
    if (!win) return `Aucune fenêtre "${appId}" ouverte.`;

    zIndexCounter++;
    win.element.style.zIndex = zIndexCounter;
    win.minimized = false;
    win.element.style.display = 'block';

    return `Fenêtre "${win.app.title}" au premier plan.`;
  }

  function minimize(appId) {
    const win = windows.find(w => w.id === appId);
    if (!win) return `Aucune fenêtre "${appId}" ouverte.`;

    win.minimized = true;
    win.element.style.display = 'none';

    return `Fenêtre "${win.app.title}" réduite.`;
  }

  function list() {
    if (windows.length === 0) return 'Aucune fenêtre ouverte.';
    return windows
      .map((w, i) => `#${String(i + 1).padStart(2, '0')} ${w.app.title}`)
      .join('\n');
  }

  function dispatchSearch(query) {
    // relaie la recherche à TOUTES les fenêtres ouvertes qui savent chercher
    windows.forEach(w => {
      if (w.app.onSearch) w.app.onSearch(query);
    });
  }

function makeDraggable(windowEl, handleEl) {
  let offsetX = 0, offsetY = 0, isDragging = false;

  handleEl.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - windowEl.offsetLeft;
    offsetY = e.clientY - windowEl.offsetTop;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    windowEl.style.left = `${e.clientX - offsetX}px`;
    windowEl.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

  return { open, close, focus, minimize, list, dispatchSearch };
}

export const windowManager = createWindowManager();