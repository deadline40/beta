// core/commandParser.js
import { commands } from './commandRegistry.js';

export function parseCommand(rawInput) {
  const trimmed = rawInput.trim();
  if (!trimmed) return '';

  const tokens = tokenize(trimmed);
  const commandName = tokens[0].toLowerCase();
  const args = tokens.slice(1);

  const handler = commands[commandName];
  if (!handler) {
    return `Commande inconnue : "${commandName}". Tape "help" pour la liste.`;
  }

  return handler(args);
}

function tokenize(input) {
  // découpe en respectant les guillemets : search "William Birkin" -> ["search", "William Birkin"]
  const regex = /"([^"]+)"|(\S+)/g;
  const tokens = [];
  let match;
  while ((match = regex.exec(input)) !== null) {
    tokens.push(match[1] ?? match[2]);
  }
  return tokens;
}