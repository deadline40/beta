// core/terminal.js
import { parseCommand } from './commandParser.js';

function createTerminal() {
  const inputEl = document.getElementById('terminal-input');
  const outputEl = document.getElementById('terminal-output');

  let history = [];      // toutes les commandes tapées, dans l'ordre
  let historyIndex = -1; // position actuelle quand on navigue avec les flèches

  function init() {
    inputEl.addEventListener('keydown', handleKeydown);
    inputEl.focus();
    printLine('Bienvenue. Tape "help" pour la liste des commandes.');
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); // empêche le curseur de sauter au début du texte
      navigateHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory(1);
    }
  }

  function submit() {
    const raw = inputEl.value;
    if (!raw.trim()) return;

    printLine(`umbrella> ${raw}`, 'echo'); // affiche ce que l'utilisateur a tapé
    history.push(raw);
    historyIndex = history.length; // se replace après la dernière commande

    const result = parseCommand(raw);
    handleResult(result);

    inputEl.value = '';
  }

  function handleResult(result) {
    if (result && typeof result === 'object' && result.clearScreen) {
      outputEl.innerHTML = '';
      return;
    }
    if (result) {
      printLine(result, 'output');
    }
  }

  function navigateHistory(direction) {
    if (history.length === 0) return;

    historyIndex += direction;
    historyIndex = Math.max(0, Math.min(historyIndex, history.length));

    inputEl.value = historyIndex === history.length ? '' : history[historyIndex];
  }

  function printLine(text, type = 'output') {
    const line = document.createElement('div');
    line.className = `terminal-line terminal-line--${type}`;
    line.textContent = text; // textContent, jamais innerHTML ici (voir explication)
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight; // auto-scroll vers le bas
  }

  return { init };
}

export const terminal = createTerminal();
