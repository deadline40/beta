/* ============================================================
   core/systemCommands.js — System commands (file, control, easter eggs)
   Registers commands: ls, cat, pwd, cd, mkdir, rm, cp, mv,
                      ps, kill, top, systemctl, df, uptime, whoami, status
                      cowsay, matrix
   ============================================================ */

// Mock filesystem structure
const FileSystem = {
  cwd: '/home/admin',
  files: {
    '/home/admin': ['reports.txt', 'secure_log.doc', 'TODO.txt', 'notes.txt'],
    '/home/admin/documents': ['classified_01.pdf', 'research.txt'],
    '/home/admin/downloads': ['update.exe', 'driver.zip'],
    '/var/log': ['system.log', 'auth.log', 'security.log', 'boot.log'],
    '/opt/umbrella': ['config.ini', 'api_key.env', 'database.sql'],
  },
  getPath: function(path) {
    if (path === '.' || path === '') return this.cwd;
    if (path === '..') return this.cwd.split('/').slice(0, -1).join('/') || '/';
    if (path.startsWith('/')) return path;
    return this.cwd + '/' + path;
  }
};

// Processes mock data
const ProcessList = [
  { pid: 1, name: 'init', cpu: '0.1%', mem: '2.3MB' },
  { pid: 142, name: 'appsManager', cpu: '4.2%', mem: '45MB' },
  { pid: 203, name: 'terminal', cpu: '1.1%', mem: '12MB' },
  { pid: 512, name: 'alessa.ai', cpu: '8.5%', mem: '78MB' },
  { pid: 613, name: 'database_monitor', cpu: '2.3%', mem: '34MB' },
  { pid: 724, name: 'security_scan', cpu: '15.2%', mem: '156MB' },
  { pid: 831, name: 'network_analyzer', cpu: '3.4%', mem: '28MB' },
];

// ============================================================
// FILE COMMANDS
// ============================================================

CommandRegistry.register('ls', 'affiche le contenu du répertoire', (args, term) => {
  const path = args[0] || FileSystem.cwd;
  const fullPath = FileSystem.getPath(path);
  const files = FileSystem.files[fullPath] || ['(répertoire vide)'];
  
  term.printLines([
    { t: 'out', v: `total ${files.length}` },
    ...files.map((f, i) => ({
      t: 'out',
      v: `  drwx------ admin admin  4096 ${new Date().toLocaleDateString('fr')} ${f}`
    }))
  ]);
});

CommandRegistry.register('pwd', 'affiche le répertoire courant', (args, term) => {
  term.print('out', FileSystem.cwd);
});

CommandRegistry.register('cd', 'change de répertoire', (args, term) => {
  const target = args[0];
  if (!target) {
    FileSystem.cwd = '/home/admin';
    term.print('out', 'retour au répertoire personnel');
  } else {
    const newPath = FileSystem.getPath(target);
    if (FileSystem.files[newPath] || newPath === '/' || newPath === '/home' || newPath === '/var') {
      FileSystem.cwd = newPath;
      term.print('out', `→ ${FileSystem.cwd}`);
    } else {
      term.print('err', `cd: ${target}: Aucun fichier ou répertoire de ce type`);
    }
  }
});

CommandRegistry.register('cat', 'affiche le contenu d\'un fichier', (args, term) => {
  if (!args[0]) {
    term.print('err', 'cat: fichier non spécifié');
    return;
  }
  const files = ['reports.txt', 'secure_log.doc', 'TODO.txt', 'system.log'];
  const file = args[0];
  
  if (files.includes(file)) {
    const contents = {
      'reports.txt': 'RAPPORT MENSUEL\n==============\nSystèmes: 98% opérateurs\nIncidents: 2 mineurs\nStatut: NOMINAL',
      'TODO.txt': '[ ] Vérifier bio-archives\n[x] Mise à jour sécurité\n[ ] Audit réseau\n[x] Backup données',
      'secure_log.doc': '14/07/2026 03:47 - Tentative accès P-0002\n14/07/2026 04:12 - Alerte confinement Secteur-3\n14/07/2026 05:33 - Réinitialisation clés API',
      'system.log': 'kernel: Memory usage: 67%\nkernel: CPU temperature: 45°C\nsystemd: Service alessa.ai started\nkernel: Network latency: 12ms'
    };
    term.print('out', contents[file] || '(fichier vide)');
  } else {
    term.print('err', `cat: ${file}: Aucun fichier de ce type`);
  }
});

CommandRegistry.register('mkdir', 'crée un répertoire', (args, term) => {
  if (!args[0]) {
    term.print('err', 'mkdir: chemin non spécifié');
    return;
  }
  const dirname = args[0];
  term.print('out', `✓ répertoire '${dirname}' créé`);
});

CommandRegistry.register('rm', 'supprime un fichier', (args, term) => {
  if (!args[0]) {
    term.print('err', 'rm: fichier non spécifié');
    return;
  }
  term.print('out', `✓ fichier '${args[0]}' supprimé`);
});

CommandRegistry.register('cp', 'copie un fichier', (args, term) => {
  if (args.length < 2) {
    term.print('err', 'cp: source et destination requises');
    return;
  }
  term.print('out', `✓ '${args[0]}' copié vers '${args[1]}'`);
});

CommandRegistry.register('mv', 'déplace/renomme un fichier', (args, term) => {
  if (args.length < 2) {
    term.print('err', 'mv: source et destination requises');
    return;
  }
  term.print('out', `✓ '${args[0]}' déplacé vers '${args[1]}'`);
});

// ============================================================
// PROCESS/SYSTEM COMMANDS
// ============================================================

CommandRegistry.register('ps', 'liste les processus en exécution', (args, term) => {
  term.printLines([
    { t: 'out', v: 'PID   NAME                  CPU      MEM' },
    { t: 'out', v: '─────────────────────────────────────────' },
    ...ProcessList.map(p => ({
      t: 'out',
      v: `${String(p.pid).padEnd(5)} ${p.name.padEnd(20)} ${p.cpu.padEnd(8)} ${p.mem}`
    }))
  ]);
});

CommandRegistry.register('kill', 'termine un processus', (args, term) => {
  if (!args[0]) {
    term.print('err', 'kill: PID non spécifié');
    return;
  }
  const pid = args[0];
  const proc = ProcessList.find(p => p.pid === parseInt(pid));
  if (proc) {
    term.print('out', `✓ signal TERM envoyé au processus ${pid} (${proc.name})`);
  } else {
    term.print('err', `kill: ${pid}: Aucun processus de ce type`);
  }
});

CommandRegistry.register('top', 'affiche l\'utilisation des ressources', (args, term) => {
  const cpu = (Math.random() * 50 + 20).toFixed(1);
  const mem = (Math.random() * 60 + 30).toFixed(1);
  const temp = (Math.random() * 15 + 35).toFixed(1);
  
  term.printLines([
    { t: 'out', v: '╔════════════════════════════════════════╗' },
    { t: 'out', v: '║ RESSOURCES SYSTEME - UMBRELLA COMPLEX  ║' },
    { t: 'out', v: '╠════════════════════════════════════════╣' },
    { t: 'out', v: `║ CPU UTILISATION        ${cpu.padEnd(20)}%║` },
    { t: 'out', v: `║ MEMOIRE UTILISEE       ${mem.padEnd(20)}%║` },
    { t: 'out', v: `║ TEMPERATURE SYSTEME    ${temp.padEnd(20)}°C║` },
    { t: 'out', v: '╠════════════════════════════════════════╣' },
    { t: 'out', v: '║ PROCESSUS TOP 3:                       ║' },
    { t: 'out', v: '║  • security_scan (15.2%)               ║' },
    { t: 'out', v: '║  • alessa.ai (8.5%)                    ║' },
    { t: 'out', v: '║  • appsManager (4.2%)                  ║' },
    { t: 'out', v: '╚════════════════════════════════════════╝' }
  ]);
});

CommandRegistry.register('df', 'affiche l\'espace disque', (args, term) => {
  term.printLines([
    { t: 'out', v: 'Système fichiers    Taille    Utilisé   Libre    Utilisé%  Montage' },
    { t: 'out', v: '─────────────────────────────────────────────────────────────────' },
    { t: 'out', v: '/dev/sda1           238G      189G      49G      79%      /' },
    { t: 'out', v: '/dev/sda2           512M      234M      278M     46%      /boot' },
    { t: 'out', v: '/dev/sdb1           1.8T      1.2T      600G     67%      /mnt/archive' },
    { t: 'out', v: 'tmpfs               16G       8.2G      7.8G     51%      /dev/shm' }
  ]);
});

CommandRegistry.register('uptime', 'affiche le temps de fonctionnement', (args, term) => {
  const upDays = Math.floor(Math.random() * 90 + 30);
  const upHours = Math.floor(Math.random() * 24);
  const upMins = Math.floor(Math.random() * 60);
  term.print('out', `Système en ligne depuis ${upDays}j ${upHours}h ${upMins}min | Charge moyenne: 2.34, 1.89, 1.54`);
});

CommandRegistry.register('whoami', 'affiche l\'utilisateur courant', (args, term) => {
  term.print('out', 'admin');
});

CommandRegistry.register('status', 'affiche le statut du système', (args, term) => {
  term.printLines([
    { t: 'out', v: '▓▓▓ STATUT SYSTEME UMBRELLA COMPLEX ▓▓▓' },
    { t: 'out', v: '' },
    { t: 'ok', v: '✓ Tous les systèmes vitaux: NOMINAUX' },
    { t: 'ok', v: '✓ Secteurs de confinement: SECURISES' },
    { t: 'ok', v: '✓ Réseau: STABLE (latence 12ms)' },
    { t: 'ok', v: '✓ Base de données: 98.7% accessible' },
    { t: 'ok', v: '✓ ALESSA A.I.: EN LIGNE' },
    { t: 'out', v: '' },
    { t: 'warn', v: '⚠ 1 alerte mineure: Température Secteur-3 légèrement élevée' }
  ]);
});

CommandRegistry.register('systemctl', 'contrôle les services système', (args, term) => {
  const service = args[0];
  const action = args[1] || 'status';
  
  if (!service) {
    term.print('err', 'systemctl: service non spécifié');
    return;
  }
  
  const services = ['alessa', 'database', 'network', 'security', 'camera'];
  if (services.includes(service)) {
    term.print('out', `✓ service '${service}' ${action} exécuté`);
  } else {
    term.print('err', `systemctl: service '${service}' introuvable`);
  }
});

// ============================================================
// EASTER EGGS
// ============================================================

CommandRegistry.register('cowsay', 'une vache qui parle (Umbrella edition)', (args, term) => {
  const messages = [
    'Bienvenue au complexe Umbrella Corporation!',
    'Conformité totale avec tous les protocoles de sécurité.',
    'Les T-virus ne s\'échapperont pas. Confinement = 100%',
    'Dr. Birkin a disparu. Statut: RECHERCHE ACTIVE',
    'HIVE: Ordinateur intelligent maintenant tous les systèmes.',
    'La science a des limites. Nous ne les respectons pas.',
  ];
  
  const msg = messages[Math.floor(Math.random() * messages.length)];
  const width = msg.length + 4;
  
  term.printLines([
    { t: 'out', v: '  ' + '─'.repeat(width) },
    { t: 'out', v: `  │ ${msg} │` },
    { t: 'out', v: '  ' + '─'.repeat(width) },
    { t: 'out', v: '        \\   ^__^' },
    { t: 'out', v: '         \\  (oo)\\_______' },
    { t: 'out', v: '            (__)\\       )\\/\\' },
    { t: 'out', v: '                ||----w |' },
    { t: 'out', v: '                ||     ||' }
  ]);
});

CommandRegistry.register('matrix', 'affichage Matrix style cascade', (args, term) => {
  const chars = '01Ｚ█▓░ｦｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺ';
  const rows = [];
  
  for (let i = 0; i < 8; i++) {
    let line = '';
    for (let j = 0; j < 45; j++) {
      line += chars[Math.floor(Math.random() * chars.length)];
    }
    rows.push({ t: 'out', v: line });
  }
  
  term.printLines(rows);
  setTimeout(() => {
    term.printLines([
      { t: 'out', v: '' },
      { t: 'out', v: '  ◄► UMBRELLA SECURITY NOTICE ◄►' },
      { t: 'out', v: '  Unauthorized access is prohibited.' },
      { t: 'out', v: '  All activities are monitored & logged.' },
      { t: 'out', v: '  Personnel involved will be terminated.' }
    ]);
  }, 500);
});
