import http from 'http';
import { WebSocketServer } from '../../websocket/websocketServer';

// Create a WebSocket server for testing
export function createTestWebSocketServer(port: number = 4002): { server: http.Server, wss: WebSocketServer } {
  const server = http.createServer();
  server.listen(port);
  
  const wss = new WebSocketServer(server);
  
  return { server, wss };
}
