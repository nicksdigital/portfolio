import WebSocket from 'ws';

// Mock WebSocket implementation for testing
class MockWebSocket {
  private callbacks: Record<string, Array<(data: any) => void>> = {
    open: [],
    message: [],
    error: [],
    close: [],
  };
  
  public readyState = 1; // WebSocket.OPEN
  
  constructor() {
    // Simulate connection
    setTimeout(() => {
      this.callbacks.open.forEach(callback => callback(null));
      
      // Send welcome message
      this.callbacks.message.forEach(callback => callback(JSON.stringify({
        type: 'WELCOME',
        data: { message: 'Connected to WebSocket server' },
      })));
    }, 0);
  }
  
  public on(event: string, callback: (data: any) => void) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
    return this;
  }
  
  public send(message: string) {
    // Echo the message back with a different type
    setTimeout(() => {
      try {
        const parsedMessage = JSON.parse(message);
        this.callbacks.message.forEach(callback => callback(JSON.stringify({
          type: `${parsedMessage.type}_RECEIVED`,
          data: parsedMessage.data,
        })));
      } catch (error) {
        this.callbacks.message.forEach(callback => callback(JSON.stringify({
          type: 'ERROR',
          data: { message: 'Invalid message format' },
        })));
      }
    }, 0);
  }
  
  public close() {
    this.callbacks.close.forEach(callback => callback(null));
  }
}

// Mock WebSocket for testing
jest.mock('ws', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => new MockWebSocket()),
  };
});

describe('WebSocket Tests', () => {
  it('should establish a connection', (done) => {
    const ws = new WebSocket('ws://localhost:4002');
    
    ws.on('open', () => {
      expect(ws.readyState).toBe(1); // WebSocket.OPEN
      done();
    });
  });
  
  it('should receive a welcome message', (done) => {
    const ws = new WebSocket('ws://localhost:4002');
    
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'WELCOME') {
        expect(message.data).toHaveProperty('message', 'Connected to WebSocket server');
        done();
      }
    });
  });
  
  it('should handle clap messages', (done) => {
    const ws = new WebSocket('ws://localhost:4002');
    
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'CLAP_RECEIVED') {
        expect(message.data).toHaveProperty('articleId', 1);
        expect(message.data).toHaveProperty('textFragment', 'This is a great article');
        expect(message.data).toHaveProperty('position');
        expect(message.data.position).toHaveProperty('startOffset', 10);
        expect(message.data.position).toHaveProperty('endOffset', 30);
        done();
      }
    });
    
    // Send a clap message
    ws.send(JSON.stringify({
      type: 'CLAP',
      data: {
        articleId: 1,
        textFragment: 'This is a great article',
        position: {
          startOffset: 10,
          endOffset: 30,
        },
      },
    }));
  });
  
  it('should handle annotation messages', (done) => {
    const ws = new WebSocket('ws://localhost:4002');
    
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'ANNOTATION_RECEIVED') {
        expect(message.data).toHaveProperty('articleId', 1);
        expect(message.data).toHaveProperty('userId', 1);
        expect(message.data).toHaveProperty('textFragment', 'This is a great article');
        expect(message.data).toHaveProperty('position');
        expect(message.data.position).toHaveProperty('startOffset', 10);
        expect(message.data.position).toHaveProperty('endOffset', 30);
        expect(message.data).toHaveProperty('note', 'I agree with this point');
        done();
      }
    });
    
    // Send an annotation message
    ws.send(JSON.stringify({
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
    }));
  });
});
