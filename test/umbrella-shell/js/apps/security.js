/* ============================================================
   apps/security.js — global: AppSecurity
   Displays the security incident log.
   ============================================================ */
window.AppSecurity = (function () {
  const { el } = window.DOMUtil;

  function render(body) {
    body.appendChild(el('div', { style: 'margin-bottom:8px; color:var(--amber); font-size:0.66rem; letter-spacing:1px;' },
      '> JOURNAL DE SECURITE — dernieres 24h'));
    SecurityData.forEach(l => {
      body.appendChild(el('div', { class: 'log-line ' + (l.level === 'crit' ? 'crit' : l.level === 'warn' ? 'warn' : '') },
        `[${l.t}] ${l.msg}`));
    });
  }

  function open() {
    WindowManager.open({
      id: 'security', title: 'SECURITE', tag: 'SEC.LOG', width: 420, height: 340,
      render
    });
  }

  CommandRegistry.register('security', 'ouvre le journal de securite', () => open());

  return { open };
})();
