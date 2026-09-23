import type { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer | null = null;
export function setWss(server: WebSocketServer) { wss = server; }
export function broadcast(event: string, data: unknown) {
  if (!wss) return;
  const msg = JSON.stringify({ event, data, at: new Date().toISOString() });
  (wss.clients as Set<WebSocket>).forEach((c: any) => {
    if (c.readyState === 1) c.send(msg);
  });
}
