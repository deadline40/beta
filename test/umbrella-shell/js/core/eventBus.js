/* ============================================================
   core/eventBus.js — global: EventBus (simple pub/sub)
   ============================================================ */
window.EventBus = (function () {
  const listeners = {};

  function on(event, handler) {
    (listeners[event] = listeners[event] || []).push(handler);
    return () => off(event, handler);
  }

  function off(event, handler) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(h => h !== handler);
  }

  function emit(event, payload) {
    (listeners[event] || []).forEach(h => {
      try { h(payload); } catch (e) { console.error('[EventBus]', event, e); }
    });
  }

  return { on, off, emit };
})();
