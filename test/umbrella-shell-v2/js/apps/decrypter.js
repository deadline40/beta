/* ============================================================
   apps/decrypter.js — global: AppDecrypter
   Opens the autonomous decrypter.html interface
   ============================================================ */
window.AppDecrypter = (function () {
  function open() {
    window.open('decrypter.html', '_blank', 'width=1300,height=900,menubar=yes,toolbar=yes,scrollbars=yes');
  }

  function openEmbedded() {
    window.AppDecrypter.open();
  }

  CommandRegistry.register('decrypter', 'ouvre le systeme de dechiffrement de fichiers', () => open());
  CommandRegistry.register('decrypt', 'alias pour decrypter', () => open());

  return { open, openEmbedded };
})();
