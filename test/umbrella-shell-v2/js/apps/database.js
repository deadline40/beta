/* ============================================================
   apps/database.js — global: AppDatabase
   Opens the autonomous database.html interface (Bio-Archives)
   ============================================================ */
window.AppDatabase = (function () {
  function open() {
    window.open('database.html', '_blank', 'width=1100,height=800,menubar=yes,toolbar=yes,scrollbars=yes');
  }

  function openEmbedded() {
    window.AppDatabase.open();
  }

  CommandRegistry.register('database', 'ouvre la base de donnees centraleles bio-archives', () => open());

  return { open, openEmbedded };
})();
