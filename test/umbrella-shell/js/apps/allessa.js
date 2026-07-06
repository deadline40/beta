/* ============================================================
   apps/allessa.js — global: AppAllessa
   A small canned-response "house AI" chat window.
   ============================================================ */
window.AppAllessa = (function () {
  const { el } = window.DOMUtil;
  let logEl;

  const RESPONSES = [
    { match: /bonjour|salut|hey/i, reply: 'Bonjour. Je suis ALESSA, intelligence de supervision du complexe. Comment puis-je vous assister ?' },
    { match: /qui es-tu|ton nom|allessa|alessa/i, reply: 'Je suis ALESSA — Autonomous Life-support & Environmental Systems Surveillance Assistant.' },
    { match: /birkin/i, reply: 'Dossier P-0002 : dernier contact enregistre a 03:03:04, secteur QUARANTAINE. Statut : PORTE DISPARU.' },
    { match: /statut|status/i, reply: 'Tous les systemes vitaux sont operationnels. 1 alerte critique active en secteur -3.' },
    { match: /aide|help/i, reply: 'Vous pouvez me demander le statut des systemes, un dossier personnel, ou l\'etat de la securite.' },
    { match: /.*/, reply: 'Requete non reconnue. Reformulez, ou consultez la base de donnees centrale.' }
  ];

  function respond(text) {
    const hit = RESPONSES.find(r => r.match.test(text));
    return hit ? hit.reply : RESPONSES[RESPONSES.length - 1].reply;
  }

  function pushMsg(cls, text) {
    logEl.appendChild(el('div', { class: cls }, text));
    logEl.scrollTop = logEl.scrollHeight;
  }

  function render(body) {
    const wrap = el('div', { class: 'allessa-chat' });
    logEl = el('div', { class: 'allessa-log' });
    const inputLine = el('div', { class: 'allessa-inputline' });
    const input = el('input', { placeholder: 'ecrire a ALESSA...' });
    const send = () => {
      const val = input.value.trim();
      if (!val) return;
      pushMsg('u-msg', '> ' + val);
      input.value = '';
      setTimeout(() => pushMsg('a-msg', 'ALESSA: ' + respond(val)), 300);
    };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
    inputLine.appendChild(input);

    wrap.appendChild(logEl);
    wrap.appendChild(inputLine);
    body.appendChild(wrap);

    pushMsg('a-msg', 'ALESSA: systeme en ligne. Je vous ecoute.');
  }

  function open() {
    WindowManager.open({
      id: 'allessa', title: 'ALESSA', tag: 'AI.CORE', width: 380, height: 340,
      render
    });
  }

  CommandRegistry.register('allessa', 'ouvre l\'assistant ALESSA', () => open());

  return { open };
})();
