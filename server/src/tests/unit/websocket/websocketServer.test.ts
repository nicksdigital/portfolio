import { WebSocketServer } from '../../../websocket/websocketServer';
import http from 'http';
import WebSocket from 'ws';

describe('WebSocketServer', () => {
  let httpServer: http.Server;
  let wss: WebSocketServer;
  let clientSocket: WebSocket;
  const PORT = 4002;
  
  beforeAll((done) => {
    // Create HTTP server
    httpServer = http.createServer();
    httpServer.listen(PORT, () => {
      // Initialize WebSocket server
      wss = new WebSocketServer(httpServer);
      done();
    });
  });
  
  afterAll((done) => {
    if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.close();
    }
    
    httpServer.close(() => {
      done();
    });
  });
  
  it('should establish a connection', (done) => {
    clientSocket = new WebSocket(`ws://localhost:${PORT}`);
    
    clientSocket.on('open', () => {
      expect(clientSocket.readyState).toBe(WebSocket.OPEN);
      done();
    });
    
    clientSocket.on('error', (error) => {
      done(error);
    });
  });
  
  it('should handle messages', (done) => {
    clientSocket = new WebSocket(`ws://localhost:${PORT}`);
    
    clientSocket.on('open', () => {
      // Send a message to the server
      const message = JSON.stringify({
        type: 'PING',
        data: { timestamp: Date.now() }
      });
      
      clientSocket.send(message);
    });
    
    clientSocket.on('message', (data) => {
      const message = JSON.parse(data.toString());
      
      // Expect a PONG response
      expect(message).toHaveProperty('type', 'PONG');
      expect(message).toHaveProperty('data');
      expect(message.data).toHaveProperty('timestamp');
      
      done();
    });
    
    clientSocket.on('error', (error) => {
      done(error);
    });
  });
  
  it('should broadcast messages to all clients', (done) => {
    // Create two client sockets
    const client1 = new WebSocket(`ws://localhost:${PORT}`);
    const client2 = new WebSocket(`ws://localhost:${PORT}`);
    
    let client2Connected = false;
    let messageReceived = false;
    
    client1.on('open', () => {
      if (client2Connected) {
        // Both clients are connected, send a broadcast message
        const message = JSON.stringify({
          type: 'BROADCAST',
          data: { message: 'Hello, everyone!' }
        });
        
        client1.send(message);
      }
    });
    
    client2.on('open', () => {
      client2Connected = true;
      
      if (client1.readyState === WebSocket.OPEN) {
        // Both clients are connected, send a broadcast message
        const message = JSON.stringify({
          type: 'BROADCAST',
          data: { message: 'Hello, everyone!' }
        });
        
        client1.send(message);
      }
    });
    
    client2.on('message', (data) => {
      const message = JSON.parse(data.toString());
      
      // Client 2 should receive the broadcast message
      if (message.type === 'BROADCAST') {
        expect(message.data).toHaveProperty('message', 'Hello, everyone!');
        messageReceived = true;
        
        // Clean up
        client1.close();
        client2.close();
        
        done();
      }
    });
    
    // Set a timeout in case the test fails
    setTimeout(() => {
      if (!messageReceived) {
        client1.close();
        client2.close();
        done(new Error('Broadcast message not received'));
      }
    }, 5000);
  });
});
