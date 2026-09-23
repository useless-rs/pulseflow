import { useEffect, useState } from 'react';

export function useRealtime() {
  const [events, setEvents] = useState<string[]>([]);
  const [online, setOnline] = useState(false);
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      ws = new WebSocket(`${proto}://${location.host}/realtime`);
      ws.onopen = () => setOnline(true);
      ws.onclose = () => setOnline(false);
      ws.onmessage = (e) => setEvents(prev => [String(e.data).slice(0, 120), ...prev].slice(0, 20));
    } catch { setOnline(false); }
    return () => ws?.close();
  }, []);
  return { events, online };
}
