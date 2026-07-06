/* ============================================================
   core/commandParser.js — global: CommandParser
   Parses a raw input line into { name, args } and dispatches to
   CommandRegistry. Supports quoted args: search "birkin".
   ============================================================ */
window.CommandParser = (function () {
  function tokenize(raw) {
    const tokens = [];
    const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    let m;
    while ((m = re.exec(raw)) !== null) {
      tokens.push(m[1] !== undefined ? m[1] : (m[2] !== undefined ? m[2] : m[3]));
    }
    return tokens;
  }

  function run(raw, term) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const tokens = tokenize(trimmed);
    const name = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    const cmd = CommandRegistry.get(name);
    if (!cmd) {
      term.print('err', `commande introuvable : ${name} — tapez "help"`);
      return;
    }
    try {
      cmd.run(args, term);
    } catch (e) {
      term.print('err', 'erreur d\'execution : ' + e.message);
    }
  }

  return { run, tokenize };
})();
