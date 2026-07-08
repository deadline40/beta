/* ============================================================
   apps/security.js — global: AppSecurity
   Opens the autonomous security.html interface
   ============================================================ */
window.AppSecurity = (function () {
  function open() {
    window.open('security.html', '_blank', 'width=1000,height=800,menubar=yes,toolbar=yes,scrollbars=yes');
  }

  function openEmbedded() {
    window.AppSecurity.open();
  }

  CommandRegistry.register('security', 'ouvre le journal de securite', () => open());

  return { open, openEmbedded };
})();
