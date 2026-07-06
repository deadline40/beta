/* ============================================================
   apps/camera.js — global: AppCamera
   Grid of simulated surveillance feeds (images + one live video).
   ============================================================ */
window.AppCamera = (function () {
  const { el } = window.DOMUtil;

  const FEEDS = [
    { label: 'CAM-01 // HALL', img: 'https://picsum.photos/seed/cam1/300/200' },
    { label: 'CAM-02 // LAB-3', video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    { label: 'CAM-03 // SOUS-SOL', img: 'https://picsum.photos/seed/cam3/300/200' },
    { label: 'CAM-04 // QUARANTAINE', img: 'https://picsum.photos/seed/cam4/300/200' },
    { label: 'CAM-05 // PARKING', img: 'https://picsum.photos/seed/cam5/300/200' },
    { label: 'CAM-06 // TOIT', img: 'https://picsum.photos/seed/cam6/300/200' }
  ];

  function render(body) {
    const grid = el('div', { class: 'cam-grid' });
    FEEDS.forEach(f => {
      const media = f.video
        ? el('video', { src: f.video, autoplay: '', loop: '', muted: '', playsinline: '' })
        : el('img', { src: f.img, alt: f.label });
      grid.appendChild(el('div', { class: 'cam-feed' }, [
        media,
        el('div', { class: 'cam-label' }, f.label),
        el('div', { class: 'cam-rec' }, '● REC')
      ]));
    });
    body.appendChild(grid);
  }

  function open() {
    WindowManager.open({
      id: 'camera', title: 'SURVEILLANCE', tag: 'CAM.SYS', width: 460, height: 380,
      render
    });
  }

  CommandRegistry.register('camera', 'ouvre les flux de video-surveillance', () => open());

  return { open };
})();
