/* ============================================================
   apps/personnel.js — global: AppPersonnel
   Opens the autonomous personnel.html interface
   ============================================================ */
window.AppPersonnel = (function () {
  function open() {
    window.open('personnel.html', '_blank', 'width=1200,height=800,menubar=yes,toolbar=yes,scrollbars=yes');
  }

  function openEmbedded() {
    window.AppPersonnel.open();
  }

  CommandRegistry.register('personnel', 'ouvre le registre du personnel', () => open());
  CommandRegistry.register('search', 'recherche un dossier: search "nom"', (args, term) => {
    const q = args.join(' ');
    term.print('ok', `recherche : "${q}" — ouverture interface personnel...`);
    setTimeout(open, 500);
  });

  return { open, openEmbedded };
})();
