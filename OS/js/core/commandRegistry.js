// core/commandRegistry.js
import { windowManager } from './windowManager.js';
import baseApp from '../apps/base.js';
import personnelApp from '../apps/personnel.js';
// ... autres apps au fur et à mesure

const appRegistry = {
  base: baseApp,
  personnel: personnelApp,
  // camera: cameraApp, etc. — ajoutées plus tard
};

export const commands = {
  help(args) {
    return `COMMANDES\n\n${Object.keys(commands).join('\n')}`;
  },

  apps(args) {
    return `APPLICATIONS\n\n${Object.keys(appRegistry).join('\n')}`;
  },

  open(args) {
    const appId = args[0];
    if (!appId) return 'Usage : open <nom>';
    return windowManager.open(appId, appRegistry);
  },

  close(args) {
    const appId = args[0];
    if (!appId) return 'Usage : close <nom>';
    return windowManager.close(appId);
  },

  focus(args) {
    const appId = args[0];
    if (!appId) return 'Usage : focus <nom>';
    return windowManager.focus(appId);
  },

  minimize(args) {
    const appId = args[0];
    if (!appId) return 'Usage : minimize <nom>';
    return windowManager.minimize(appId);
  },

  list(args) {
    return `WINDOWS\n\n${windowManager.list()}`;
  },

  search(args) {
    const query = args.join(' ');
    if (!query) return 'Usage : search "texte"';
    windowManager.dispatchSearch(query);
    return `Recherche : "${query}"`;
  },

  clear(args) {
    return { clearScreen: true }; // cas spécial, voir plus bas
  },
};