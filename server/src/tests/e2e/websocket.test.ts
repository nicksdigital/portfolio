import http from 'http';
import WebSocket from 'ws';
import { createTestWebSocketServer } from './websocketSetup';

describe('WebSocket Server E2E Tests', () => {
  let httpServer: http.Server;
  let clientSocket: WebSocket;
  const PORT = 4002;

  beforeAll((done) => {
    // Create WebSocket server
    const { server } = createTestWebSocketServer(PORT);
    httpServer = server;
    done();
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

  it('should handle clap messages', (done) => {
    clientSocket = new WebSocket(`ws://localhost:${PORT}`);

    clientSocket.on('open', () => {
      // Send a clap message
      const message = JSON.stringify({
        type: 'CLAP',
        data: {
          articleId: 1,
          textFragment: 'This is a great article',
          position: {
            startOffset: 10,
            endOffset: 30,
          },
        },
      });

      clientSocket.send(message);
    });

    clientSocket.on('message', (data) => {
      const message = JSON.parse(data.toString());

      // Expect a response with the same type
      expect(message).toHaveProperty('type', 'CLAP_RECEIVED');
      expect(message).toHaveProperty('data');
      expect(message.data).toHaveProperty('articleId', 1);

      done();
    });

    clientSocket.on('error', (error) => {
      done(error);
    });
  });

  it('should handle annotation messages', (done) => {
    clientSocket = new WebSocket(`ws://localhost:${PORT}`);

    clientSocket.on('open', () => {
      // Send an annotation message
      const message = JSON.stringify({
        type: 'ANNOTATION',
        data: {
          articleId: 1,
          userId: 1,
          textFragment: 'This is a great article',
          position: {
            startOffset: 10,
            endOffset: 30,
          },
          note: 'I agree with this point',
        },
      });

      clientSocket.send(message);
    });

    clientSocket.on('message', (data) => {
      const message = JSON.parse(data.toString());

      // Expect a response with the same type
      expect(message).toHaveProperty('type', 'ANNOTATION_RECEIVED');
      expect(message).toHaveProperty('data');
      expect(message.data).toHaveProperty('articleId', 1);
      expect(message.data).toHaveProperty('note', 'I agree with this point');

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
          data: {
            articleId: 1,
            message: 'Hello, everyone!',
          },
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
          data: {
            articleId: 1,
            message: 'Hello, everyone!',
          },
        });

        client1.send(message);
      }
    });

    client2.on('message', (data) => {
      const message = JSON.parse(data.toString());

      // Client 2 should receive the broadcast message
      if (message.type === 'BROADCAST_RECEIVED') {
        expect(message.data).toHaveProperty('articleId', 1);
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
