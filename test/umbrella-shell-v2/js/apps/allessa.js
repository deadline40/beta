/* ============================================================
   apps/allessa.js — global: AppAllessa
   Opens the autonomous alessa.html A.I. interface
   ============================================================ */
window.AppAllessa = (function () {
  function open() {
    window.open('alessa.html', '_blank', 'width=1000,height=750,menubar=yes,toolbar=yes,scrollbars=yes');
  }

  function openEmbedded() {
    window.AppAllessa.open();
  }

  CommandRegistry.register('alessa', 'ouvre l\'assistant ALESSA', () => open());
  CommandRegistry.register('ai', 'alias pour alessa', () => open());

  return { open, openEmbedded };
})();
