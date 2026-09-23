import { useEffect, useState } from 'react';
import { wsUrl } from './api';

export function useRealtime() {
  const [events, setEvents] = useState<string[]>([]);
  const [online, setOnline] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  useEffect(() => {
    let ws: WebSocket | null = null;
    let closed = false;
    const connect = () => {
      try {
        ws = new WebSocket(wsUrl('/realtime'));
      } catch { setOnline(false); return; }
      ws.onopen = () => { if (!closed) setOnline(true); };
      ws.onclose = () => { setOnline(false); };
      ws.onmessage = (e) => {
        const raw = String(e.data);
        try {
          const msg = JSON.parse(raw) as { event?: string; data?: { online?: number } };
          if (typeof msg?.data?.online === 'number') setOnlineCount(msg.data.online);
        } catch { /* non-JSON payloads are still recorded below */ }
        setEvents(prev => [raw, ...prev].slice(0, 20));
      };
    };
    connect();
    return () => { closed = true; ws?.close(); };
  }, []);
  return { events, online, onlineCount };
}
