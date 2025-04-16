import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import { URL } from 'url';

// Client connection type with articleId
interface ClientConnection {
  ws: WebSocket;
  articleId: number;
}

// WebSocket handler for the server
export class AppWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, ClientConnection> = new Map();

  constructor(server: HttpServer | HttpsServer) {
    this.wss = new WebSocketServer({ noServer: true });
    this.setupWebSocketServer(server);
  }

  private setupWebSocketServer(server: HttpServer | HttpsServer) {
    // Handle upgrade requests
    server.on('upgrade', (request, socket, head) => {
      // Check if the request is for our WebSocket server
      if (!request.url) {
        socket.destroy();
        return;
      }

      // Parse the URL to get the article ID
      const pathname = new URL(request.url, 'http://localhost').pathname;
      const match = pathname.match(/^\/ws\/articles\/(\d+)$/);
      
      if (!match) {
        console.log(`Invalid WebSocket URL: ${pathname}`);
        socket.destroy();
        return;
      }

      const articleId = parseInt(match[1], 10);
      
      if (isNaN(articleId)) {
        console.log(`Invalid article ID in WebSocket URL: ${pathname}`);
        socket.destroy();
        return;
      }

      // Upgrade the connection to WebSocket
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request, articleId);
      });
    });

    // Handle new connections
    this.wss.on('connection', (ws: WebSocket, request: any, articleId: number) => {
      console.log(`New WebSocket connection for article ${articleId}`);
      
      // Store the client connection with articleId
      this.clients.set(ws, { ws, articleId });

      // Send a welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        payload: {
          message: `Connected to article ${articleId}`,
          articleId
        }
      }));

      // Handle messages from the client
      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          const { type, payload } = data;

          console.log(`Received ${type} message for article ${articleId}:`, payload);

          // Add the articleId to the payload if not already present
          const enrichedPayload = {
            ...payload,
            articleId: payload.articleId || articleId
          };

          // Broadcast the message to all clients subscribed to this article
          this.broadcastToArticle(articleId, type, enrichedPayload);
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      // Handle client disconnection
      ws.on('close', () => {
        console.log(`WebSocket connection closed for article ${articleId}`);
        this.clients.delete(ws);
      });
    });
  }

  // Broadcast a message to all clients subscribed to a specific article
  public broadcastToArticle(articleId: number, type: string, payload: any) {
    for (const [_, client] of this.clients.entries()) {
      if (client.articleId === articleId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({ type, payload }));
      }
    }
  }

  // Send a message to a specific client
  public sendToClient(ws: WebSocket, type: string, payload: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  }

  // Get the current number of connected clients
  public getClientCount(): number {
    return this.clients.size;
  }
}
