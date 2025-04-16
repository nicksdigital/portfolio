import { WebSocket, WebSocketServer as WSServer } from 'ws';
import { Server } from 'http';
import { parse } from 'url';

interface ClientConnection {
  ws: WebSocket;
  articleId: number;
  userId?: string;
}

type MessageHandler = (articleId: number, data: any, sender: WebSocket) => void;

export class WebSocketServer {
  private wss: WSServer;
  private clients: Map<WebSocket, ClientConnection> = new Map();
  private handlers: Map<string, MessageHandler> = new Map();

  constructor(server: Server) {
    this.wss = new WSServer({ noServer: true });
    this.setupHandlers();
    this.setupWebSocketServer(server);
  }

  private setupHandlers() {
    // Register message handlers
    this.handlers.set('clap', this.handleClap.bind(this));
    this.handlers.set('annotation', this.handleAnnotation.bind(this));
  }

  private setupWebSocketServer(server: Server) {
    // Handle upgrade requests
    server.on('upgrade', (request, socket, head) => {
      if (!request.url) {
        socket.destroy();
        return;
      }

      const { pathname, query } = parse(request.url, true);
      const match = pathname?.match(/^\/ws\/articles\/(\d+)$/);
      
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

      // Extract user ID from query or auth token
      const userId = query.userId as string || 'anonymous';

      // Upgrade the connection to WebSocket
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request, articleId, userId);
      });
    });

    // Handle new connections
    this.wss.on('connection', (ws: WebSocket, request: any, articleId: number, userId: string) => {
      console.log(`New WebSocket connection for article ${articleId} from user ${userId}`);
      
      // Store the client connection with articleId
      this.clients.set(ws, { ws, articleId, userId });

      // Send a welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        payload: {
          message: `Connected to article ${articleId}`,
          articleId,
          userId
        }
      }));

      // Handle messages from the client
      ws.on('message', (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());
          const { type, payload } = data;

          console.log(`Received ${type} message for article ${articleId}:`, payload);

          // Add the articleId to the payload if not already present
          const enrichedPayload = {
            ...payload,
            articleId: payload.articleId || articleId,
            userId: payload.userId || userId
          };

          // Find and execute the handler for this message type
          const handler = this.handlers.get(type);
          if (handler) {
            handler(articleId, enrichedPayload, ws);
          } else {
            console.warn(`No handler for message type: ${type}`);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      // Handle client disconnection
      ws.on('close', () => {
        console.log(`WebSocket connection closed for article ${articleId}`);
        this.clients.delete(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for article ${articleId}:`, error);
        this.clients.delete(ws);
      });
    });
  }

  // Handler for 'clap' messages
  private handleClap(articleId: number, data: any, sender: WebSocket) {
    // Implement clap handling logic here
    // Example: store the clap in the database
    
    // Broadcast to all other clients
    this.broadcast(articleId, 'clap', data, sender);
  }

  // Handler for 'annotation' messages
  private handleAnnotation(articleId: number, data: any, sender: WebSocket) {
    // Implement annotation handling logic here
    // Example: store the annotation in the database
    
    // Broadcast to all other clients
    this.broadcast(articleId, 'annotation', data, sender);
  }

  // Broadcast a message to all clients connected to a specific article
  public broadcast(articleId: number, type: string, data: any, excludeClient?: WebSocket) {
    const message = JSON.stringify({ type, payload: data });
    
    for (const [ws, client] of this.clients.entries()) {
      if (
        client.articleId === articleId && 
        ws.readyState === WebSocket.OPEN &&
        ws !== excludeClient
      ) {
        ws.send(message);
      }
    }
  }

  // Send a message to a specific client
  public sendTo(ws: WebSocket, type: string, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload: data }));
    }
  }

  // Get client count
  public getClientCount(articleId?: number): number {
    if (articleId) {
      return Array.from(this.clients.values()).filter(c => c.articleId === articleId).length;
    }
    return this.clients.size;
  }
}
