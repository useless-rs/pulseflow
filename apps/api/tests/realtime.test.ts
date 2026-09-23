import { describe, it, expect } from 'vitest';
import http from 'http';
import { WebSocket } from 'ws';
import { createApp } from '../src/app.js';
import { attachRealtime } from '../src/lib/websocket.js';

function nextMessage(ws: WebSocket): Promise<string> {
  return new Promise<string>((resolve) => {
    ws.once('message', (data: unknown) => resolve(String(data)));
  });
}

describe('realtime presence', () => {
  it('broadcasts join/leave with online counts', async () => {
    const server = http.createServer(createApp());
    attachRealtime(server);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;
    const url = `ws://localhost:${port}/realtime`;

    const a = new WebSocket(url);
    const helloA = JSON.parse(await nextMessage(a));
    expect(helloA.event).toBe('hello');
    expect(typeof helloA.data.clientId).toBe('string');

    const b = new WebSocket(url);
    const joined = JSON.parse(await nextMessage(a));
    expect(joined.event).toBe('presence.joined');
    expect(joined.data.online).toBe(2);
    expect(typeof joined.data.clientId).toBe('string');

    b.close();
    const left = JSON.parse(await nextMessage(a));
    expect(left.event).toBe('presence.left');
    expect(left.data.online).toBe(1);

    a.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }, 15000);
});
