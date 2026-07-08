/* ============================================================
   apps/network.js — global: AppNetwork
   Opens the autonomous network.html interface
   ============================================================ */
window.AppNetwork = (function () {
  function open() {
    window.open('network.html', '_blank', 'width=1100,height=800,menubar=yes,toolbar=yes,scrollbars=yes');
  }

  function openEmbedded() {
    window.AppNetwork.open();
  }

  CommandRegistry.register('network', 'ouvre l\'analyseur reseau', () => open());
  CommandRegistry.register('scan', 'alias pour network', () => open());

  return { open, openEmbedded };
})();
