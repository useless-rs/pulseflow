import { useEffect, useState } from 'react';
import { wsUrl } from './api';

export function useRealtime() {
  const [events, setEvents] = useState<string[]>([]);
  const [online, setOnline] = useState(false);
  useEffect(() => {
    let ws: WebSocket | null = null;
    let closed = false;
    const connect = () => {
      try {
        ws = new WebSocket(wsUrl('/realtime'));
      } catch { setOnline(false); return; }
      ws.onopen = () => { if (!closed) setOnline(true); };
      ws.onclose = () => { setOnline(false); };
      ws.onmessage = (e) => setEvents(prev => [String(e.data).slice(0, 120), ...prev].slice(0, 20));
    };
    connect();
    return () => { closed = true; ws?.close(); };
  }, []);
  return { events, online };
}
