/* ============================================================
   utils/fuzzySearch.js — global: FuzzySearch
   Basic case-insensitive substring + subsequence fuzzy matcher.
   ============================================================ */
window.FuzzySearch = (function () {
  function normalize(s) {
    return (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // returns true if `query` chars appear in order within `text` (subsequence),
  // OR if text simply contains query as a substring (fast path).
  function isMatch(query, text) {
    const q = normalize(query);
    const t = normalize(text);
    if (!q) return true;
    if (t.includes(q)) return true;
    let qi = 0;
    for (let i = 0; i < t.length && qi < q.length; i++) {
      if (t[i] === q[qi]) qi++;
    }
    return qi === q.length;
  }

  // search an array of records against a query, checking given fields
  function search(records, query, fields) {
    if (!query) return records;
    return records.filter(r => fields.some(f => isMatch(query, r[f])));
  }

  return { isMatch, search };
})();
