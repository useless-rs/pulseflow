import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { attachRealtime } from './lib/websocket.js';
import { seed } from './lib/db.js';

seed();
const app = createApp();
const server = http.createServer(app);
attachRealtime(server);

server.listen(env.PORT, () => console.log(`⚡ PulseFlow API on :${env.PORT}`));
