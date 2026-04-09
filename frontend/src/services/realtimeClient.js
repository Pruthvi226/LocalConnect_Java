import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';

let client = null;
let subscriptions = [];

export function connectRealtime(token, onMessage, onNotification) {
  if (client?.connected) return client;

  const sock = new SockJS(WS_URL);
  client = new Client({
    webSocketFactory: () => sock,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      const subMsg = client.subscribe('/Customer/queue/messages', (frame) => {
        try {
          const body = JSON.parse(frame.body);
          onMessage?.(body);
        } catch (e) {
          console.warn('Parse message failed', e);
        }
      });
      subscriptions.push(subMsg);

      const subNotif = client.subscribe('/Customer/queue/notifications', (frame) => {
        try {
          const body = JSON.parse(frame.body);
          onNotification?.(body);
        } catch (e) {
          console.warn('Parse notification failed', e);
        }
      });
      subscriptions.push(subNotif);
    },
    onStompError: (frame) => {
      console.warn('STOMP error', frame);
    },
  });

  client.activate();
  return client;
}

export function disconnectRealtime() {
  subscriptions.forEach((s) => s.unsubscribe());
  subscriptions = [];
  if (client) {
    client.deactivate();
    client = null;
  }
}

export function isRealtimeConnected() {
  return client?.connected ?? false;
}

