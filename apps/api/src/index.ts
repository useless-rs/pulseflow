import http from 'http';
import { WebSocketServer } from 'ws';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { setWss } from './lib/websocket.js';
import { seed } from './lib/db.js';

seed();
const app = createApp();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/realtime' });
setWss(wss);
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ event: 'hello', data: { service: 'pulseflow-realtime' } }));
});

server.listen(env.PORT, () => console.log(`⚡ PulseFlow API on :${env.PORT}`));
