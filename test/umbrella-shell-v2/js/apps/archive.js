/* ============================================================
   apps/archive.js — global: AppArchive
   Opens the autonomous archive.html interface
   ============================================================ */
window.AppArchive = (function () {
  function open() {
    window.open('archive.html', '_blank', 'width=1100,height=850,menubar=yes,toolbar=yes,scrollbars=yes');
  }

  function openEmbedded() {
    window.AppArchive.open();
  }

  CommandRegistry.register('archive', 'ouvre les archives (documents / images / videos)', () => open());

  return { open, openEmbedded };
})();
