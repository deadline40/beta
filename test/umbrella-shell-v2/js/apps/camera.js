/* ============================================================
   apps/camera.js — global: AppCamera
   Opens the autonomous camera.html interface
   ============================================================ */
window.AppCamera = (function () {
  function open() {
    window.open('camera.html', '_blank', 'width=1200,height=900,menubar=yes,toolbar=yes,scrollbars=yes');
  }

  function openEmbedded() {
    window.AppCamera.open();
  }

  CommandRegistry.register('camera', 'ouvre les flux de video-surveillance', () => open());

  return { open, openEmbedded };
})();
