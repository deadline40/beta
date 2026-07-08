/* ============================================================
   apps/umbrellanet.js — global: AppUmbrellaNet
   Opens the autonomous umbrellanet.html interface
   ============================================================ */
window.AppUmbrellaNet = (function () {
  function open() {
    window.open('umbrellanet.html', '_blank', 'width=1000,height=700,menubar=no,toolbar=no,scrollbars=yes');
  }

  function openEmbedded() {
    window.AppUmbrellaNet.open();
  }

  CommandRegistry.register('umbrellanet', 'ouvre le navigateur intranet', () => open());

  return { open, openEmbedded };
})();
