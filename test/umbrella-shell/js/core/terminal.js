/* ============================================================
   core/terminal.js — global: Terminal
   Captures input, renders output lines, keeps arrow-key history.
   ============================================================ */
window.Terminal = (function () {
  const { el } = window.DOMUtil;
  let outputEl, inputEl;
  const history = [];
  let histIdx = -1;

  function print(type, text) {
    const line = el('div', { class: 't-line ' + type }, text);
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function printLines(lines) {
    lines.forEach(l => print(l.t, l.v));
  }

  function clearOutput() { DOMUtil.clear(outputEl); }

  function submit(raw) {
    print('cmd', '> ' + raw);
    if (raw.trim()) {
      history.unshift(raw);
      histIdx = -1;
    }
    CommandParser.run(raw, api);
    EventBus.emit('terminal:command', raw);
  }

  function init() {
    outputEl = document.getElementById('terminal-output');
    inputEl = document.getElementById('terminal-input');

    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const val = inputEl.value;
        inputEl.value = '';
        submit(val);
      }
      if (e.key === 'ArrowUp') {
        if (histIdx < history.length - 1) histIdx++;
        inputEl.value = history[histIdx] || '';
        e.preventDefault();
      }
      if (e.key === 'ArrowDown') {
        if (histIdx > 0) histIdx--; else histIdx = -1;
        inputEl.value = histIdx === -1 ? '' : (history[histIdx] || '');
        e.preventDefault();
      }
    });

    inputEl.focus();
    document.addEventListener('click', e => {
      if (!e.target.closest('.app-window')) inputEl.focus();
    });
  }

  const api = { print, printLines, clear: clearOutput, focusInput: () => inputEl.focus() };
  return Object.assign({ init }, api);
})();
