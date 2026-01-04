
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const sessions = new Map(); // sessionId -> Set(clients)

console.log("Community Captioner Relay running on ws://localhost:8080");

wss.on('connection', (ws, req) => {
  let currentSessionId = null;
  let isBroadcaster = false;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // 1. Join a Session
      if (data.type === 'join') {
        currentSessionId = data.sessionId;
        if (!sessions.has(currentSessionId)) {
          sessions.set(currentSessionId, new Set());
        }
        sessions.get(currentSessionId).add(ws);
        
        if (data.role === 'broadcaster') {
            isBroadcaster = true;
            console.log(`Broadcaster joined session: ${currentSessionId}`);
        } else {
            console.log(`Audience joined session: ${currentSessionId}`);
        }
      }

      // 2. Broadcast Caption Data
      if (data.type === 'caption' && currentSessionId && sessions.has(currentSessionId)) {
        const clients = sessions.get(currentSessionId);
        // Relay to all OTHER clients in this session
        clients.forEach(client => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify(data));
          }
        });
      }

    } catch (e) {
      console.error("Parse error", e);
    }
  });

  ws.on('close', () => {
    if (currentSessionId && sessions.has(currentSessionId)) {
      sessions.get(currentSessionId).delete(ws);
      if (sessions.get(currentSessionId).size === 0) {
        sessions.delete(currentSessionId);
      }
    }
  });
});
