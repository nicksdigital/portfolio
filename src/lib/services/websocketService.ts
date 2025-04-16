'use client';

/**
 * Simple WebSocket Service for real-time communication
 */
class WebSocketService {
  private socket: WebSocket | null = null;
  private articleId: number | null = null;
  private isConnected = false;
  private reconnectInterval = 3000;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private subscribers: Record<string, Function[]> = {};

  // Connect to the WebSocket server
  connect(articleId: number) {
    this.articleId = articleId;

    // If already connected to the same article, do nothing
    if (this.isConnected && this.socket && this.articleId === articleId) {
      return;
    }

    // Close any existing connection
    if (this.socket) {
      this.socket.close();
    }

    // Create a new WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.socket = new WebSocket(`${protocol}//${host}/ws/articles/${articleId}`);

    // Set up event handlers
    this.socket.onopen = this.handleOpen.bind(this);
    this.socket.onmessage = this.handleMessage.bind(this);
    this.socket.onclose = this.handleClose.bind(this);
    this.socket.onerror = this.handleError.bind(this);
  }

  // Handle WebSocket open event
  private handleOpen() {
    console.log('[WebSocketService] Connected to WebSocket server');
    this.isConnected = true;
    this.reconnectAttempts = 0;
  }

  // Handle WebSocket message event
  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      const { type, payload } = data;

      if (type && this.subscribers[type]) {
        this.subscribers[type].forEach(callback => callback(payload));
      }
    } catch (error) {
      console.error('[WebSocketService] Error handling message:', error);
    }
  }

  // Handle WebSocket close event
  private handleClose(event: CloseEvent) {
    console.log(`[WebSocketService] Disconnected from WebSocket server: ${event.reason}`);
    this.isConnected = false;
    this.socket = null;

    // Attempt to reconnect if not a clean close
    if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`[WebSocketService] Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.reconnectAttempts++;
        if (this.articleId !== null) {
          this.connect(this.articleId);
        }
      }, this.reconnectInterval);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocketService] Max reconnect attempts reached, switching to fallback mode');
      
      // Notify subscribers of fallback mode
      if (this.subscribers['fallback']) {
        this.subscribers['fallback'].forEach(callback => callback({
          reason: 'Max reconnect attempts reached'
        }));
      }
    }
  }

  // Handle WebSocket error event
  private handleError(event: Event) {
    console.error('[WebSocketService] WebSocket error:', event);
    
    // Check if we should trigger fallback mode
    if (this.subscribers['fallback']) {
      this.subscribers['fallback'].forEach(callback => callback({
        reason: 'WebSocket error occurred'
      }));
    }
  }

  // Subscribe to a specific event type
  subscribe(type: string, callback: Function) {
    if (!this.subscribers[type]) {
      this.subscribers[type] = [];
    }
    this.subscribers[type].push(callback);
  }

  // Unsubscribe from a specific event type
  unsubscribe(type: string, callback: Function) {
    if (!this.subscribers[type]) return;
    this.subscribers[type] = this.subscribers[type].filter(cb => cb !== callback);
  }

  // Send a message to the WebSocket server
  send(type: string, payload: any) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocketService] Cannot send message, socket is not open');
      return false;
    }

    try {
      this.socket.send(JSON.stringify({ type, payload, articleId: this.articleId }));
      return true;
    } catch (error) {
      console.error('[WebSocketService] Error sending message:', error);
      return false;
    }
  }

  // Disconnect from the WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.articleId = null;
  }

  // Check if connected
  isSocketConnected() {
    return this.isConnected;
  }
}

// Create a singleton instance
export const websocketService = new WebSocketService();
