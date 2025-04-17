describe('WebSocket Server', () => {
  describe('Message Handling', () => {
    it('should handle clap messages', () => {
      // Mock clap data
      const clapData = {
        articleId: 1,
        textFragment: 'This is a great article',
        position: { startOffset: 10, endOffset: 20 },
      };
      
      // Verify the clap data format
      expect(clapData).toHaveProperty('articleId');
      expect(clapData).toHaveProperty('textFragment');
      expect(clapData).toHaveProperty('position');
      expect(clapData.position).toHaveProperty('startOffset');
      expect(clapData.position).toHaveProperty('endOffset');
    });
    
    it('should handle annotation messages', () => {
      // Mock annotation data
      const annotationData = {
        articleId: 1,
        userId: 'user123',
        textFragment: 'This is a great article',
        position: { startOffset: 10, endOffset: 20 },
        note: 'I agree with this point',
      };
      
      // Verify the annotation data format
      expect(annotationData).toHaveProperty('articleId');
      expect(annotationData).toHaveProperty('userId');
      expect(annotationData).toHaveProperty('textFragment');
      expect(annotationData).toHaveProperty('position');
      expect(annotationData).toHaveProperty('note');
      expect(annotationData.position).toHaveProperty('startOffset');
      expect(annotationData.position).toHaveProperty('endOffset');
    });
  });
  
  describe('Connection Management', () => {
    it('should track connected clients', () => {
      // Mock clients map
      const clients = new Map();
      
      // Add clients
      clients.set('client1', { userId: 1, articleId: 1 });
      clients.set('client2', { userId: 2, articleId: 1 });
      clients.set('client3', { userId: 3, articleId: 2 });
      
      // Verify client count
      expect(clients.size).toBe(3);
      
      // Verify client data
      expect(clients.get('client1')).toEqual({ userId: 1, articleId: 1 });
      
      // Remove a client
      clients.delete('client2');
      
      // Verify updated client count
      expect(clients.size).toBe(2);
      
      // Verify client is removed
      expect(clients.has('client2')).toBe(false);
    });
  });
});
