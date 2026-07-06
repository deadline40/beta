// apps/base.js
import { BASE_DATA } from '../data/base.data.js';

function createBaseApp() {
  let containerRef = null;
  let currentEntry = null; // null = vue liste, sinon une entrée précise

  function render(container) {
    containerRef = container;
    containerRef.addEventListener('click', handleClick); // posé UNE fois
    renderCurrentView();
  }

  function renderCurrentView() {
    containerRef.innerHTML = currentEntry
      ? renderDetail(currentEntry)
      : renderList(BASE_DATA);
  }

  function renderList(entries) {
    if (entries.length === 0) {
      return `<p class="empty-state">Aucune entrée trouvée.</p>`;
    }
    return `
      <ul class="base-list">
        ${entries.map(e => `
          <li data-id="${e.id}">
            ${e.titre} <span class="tag">${e.categorie}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  function renderDetail(entry) {
    return `
      <div class="base-detail">
        <button class="btn-back">&larr; retour</button>
        <h2>${entry.titre}</h2>
        <p class="tag">${entry.categorie}</p>
        <p>${entry.details}</p>
      </div>
    `;
  }

  function handleClick(e) {
    if (e.target.classList.contains('btn-back')) {
      currentEntry = null;
      renderCurrentView();
      return;
    }

    const li = e.target.closest('.base-list li');
    if (li) {
      const id = Number(li.dataset.id);
      currentEntry = BASE_DATA.find(entry => entry.id === id);
      renderCurrentView();
    }
  }

  function onSearch(query) {
    const q = query.toLowerCase();
    const filtered = BASE_DATA.filter(e =>
      e.titre.toLowerCase().includes(q) || e.categorie.toLowerCase().includes(q)
    );
    currentEntry = null;
    containerRef.innerHTML = renderList(filtered);
  }

  function onClose() {
    currentEntry = null;
    if (containerRef) containerRef.removeEventListener('click', handleClick);
  }

  return { id: 'base', title: 'Database', render, onSearch, onClose };
}

export default createBaseApp();