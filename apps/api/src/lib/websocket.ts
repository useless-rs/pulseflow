import type { Server } from 'http';
import { WebSocketServer, type WebSocket } from 'ws';
import { randomUUID } from 'crypto';

let wss: WebSocketServer | null = null;
let clientSeq = 0;

export function onlineCount(): number {
  if (!wss) return 0;
  let n = 0;
  (wss.clients as Set<WebSocket>).forEach((c: WebSocket) => {
    if (c.readyState === 1) n += 1;
  });
  return n;
}

export function setWss(server: WebSocketServer) { wss = server; }

export function broadcast(event: string, data: unknown) {
  if (!wss) return;
  const msg = JSON.stringify({ event, data, at: new Date().toISOString() });
  (wss.clients as Set<WebSocket>).forEach((c: WebSocket) => {
    if (c.readyState === 1) c.send(msg);
  });
}

export function attachRealtime(server: Server, path = '/realtime'): WebSocketServer {
  const hub = new WebSocketServer({ server, path });
  setWss(hub);
  hub.on('connection', (ws: WebSocket) => {
    const clientId = `c_${randomUUID().slice(0, 8)}${++clientSeq}`;
    (ws as WebSocket & { clientId?: string }).clientId = clientId;
    ws.send(JSON.stringify({
      event: 'hello',
      data: { service: 'pulseflow-realtime', clientId, online: onlineCount() },
    }));
    broadcast('presence.joined', { clientId, online: onlineCount() });
    ws.on('close', () => {
      broadcast('presence.left', { clientId, online: onlineCount() });
    });
  });
  return hub;
}
