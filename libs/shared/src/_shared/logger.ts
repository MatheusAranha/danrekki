import type { ILog } from './types';

export function info(message: string, log: ILog): void {
  console.log(JSON.stringify({ level: 'info', message, ...log }));
}

export function error(message: string, log: ILog): void {
  console.error(JSON.stringify({ level: 'error', message, ...log }));
}
