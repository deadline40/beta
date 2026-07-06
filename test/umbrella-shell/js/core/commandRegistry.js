/* ============================================================
   core/commandRegistry.js — global: CommandRegistry
   Object map { name: { desc, run(args, term) } }. Apps register
   their own commands via CommandRegistry.register(...).
   ============================================================ */
window.CommandRegistry = (function () {
  const commands = {};

  function register(name, desc, run) {
    commands[name] = { desc, run };
  }

  function get(name) { return commands[name]; }
  function all() { return commands; }

  return { register, get, all };
})();
