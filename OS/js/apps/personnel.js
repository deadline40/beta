// apps/personnel.js
import { PERSONNEL_DATA } from '../data/personnel.data.js';

function createPersonnelApp() {
  let containerRef = null;
  let currentDossier = null; // null = vue liste, sinon un dossier précis

  function render(container) {
    containerRef = container;
    containerRef.addEventListener('click', handleClick);
    renderCurrentView();
  }

  function renderCurrentView() {
    containerRef.innerHTML = currentDossier
      ? renderDossier(currentDossier)
      : renderList(PERSONNEL_DATA);
  }

  function renderList(entries) {
    if (entries.length === 0) {
      return `<p class="empty-state">Aucun dossier trouvé.</p>`;
    }
    return `
      <ul class="personnel-list">
        ${entries.map(p => `
          <li data-id="${p.id}">
            ${p.nom} <span class="tag tag--${p.statut === 'Actif' ? 'ok' : 'alert'}">${p.statut}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  function renderDossier(p) {
    return `
      <div class="personnel-detail">
        <button class="btn-back">&larr; retour</button>
        <h2>${p.nom}</h2>
        <p class="tag tag--${p.statut === 'Actif' ? 'ok' : 'alert'}">${p.statut}</p>
        <p><strong>Poste :</strong> ${p.poste}</p>
        <p>${p.details}</p>
      </div>
    `;
  }

  function handleClick(e) {
    if (e.target.classList.contains('btn-back')) {
      currentDossier = null;
      renderCurrentView();
      return;
    }

    const li = e.target.closest('.personnel-list li');
    if (li) {
      const id = Number(li.dataset.id);
      currentDossier = PERSONNEL_DATA.find(p => p.id === id);
      renderCurrentView();
    }
  }

  function onSearch(query) {
    const q = query.toLowerCase();

    // recherche exacte-ish sur le nom -> ouvre directement le dossier (comme dans l'exemple d'origine)
    const found = PERSONNEL_DATA.find(p => p.nom.toLowerCase().includes(q));

    if (found) {
      currentDossier = found;
      renderCurrentView();
      return;
    }

    // sinon, on retombe sur une liste filtrée (poste, statut...)
    const filtered = PERSONNEL_DATA.filter(p =>
      p.poste.toLowerCase().includes(q) || p.statut.toLowerCase().includes(q)
    );
    currentDossier = null;
    containerRef.innerHTML = renderList(filtered);
  }

  function onClose() {
    currentDossier = null;
    if (containerRef) containerRef.removeEventListener('click', handleClick);
  }

  return { id: 'personnel', title: 'Personnel Files', render, onSearch, onClose };
}

export default createPersonnelApp();