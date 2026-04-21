import { bold, lightMagenta } from 'kolorist';

export function warn(message: string) {
  console.warn(`${bold(lightMagenta('[@viyuni/musea]'))} ${message}`);
}
