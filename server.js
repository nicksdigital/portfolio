import express from 'express';
import http from 'http';
import cors from 'cors';
import { parse } from 'url';
import next from 'next';
import { AppWebSocketServer } from './src/lib/websockets/websocketServer.js';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3001;

// In-memory storage for data
const articleClaps = new Map();
const articleAnnotations = new Map();

// Prepare the Next.js app
app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // Enable CORS
  server.use(cors());

  // Parse JSON request bodies
  server.use(express.json());

  // Set up the WebSocket server
  const websocketServer = new AppWebSocketServer(httpServer);

  // API Routes

  // Get claps for an article
  server.get('/api/articles/:id/claps', (req, res) => {
    const articleId = parseInt(req.params.id);

    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const claps = articleClaps.get(articleId) || [];
    res.json(claps);
  });

  // Add a clap to an article
  server.post('/api/articles/:id/claps', (req, res) => {
    const articleId = parseInt(req.params.id);

    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const { textFragment, position } = req.body;

    if (!textFragment || !position) {
      return res.status(400).json({
        error: 'Missing required fields: textFragment, position'
      });
    }

    // Store the clap
    if (!articleClaps.has(articleId)) {
      articleClaps.set(articleId, []);
    }

    // Check if this text fragment already has claps
    const claps = articleClaps.get(articleId);
    const existingClapIndex = claps.findIndex(clap =>
      clap.textFragment === textFragment
    );

    let clapData;

    if (existingClapIndex >= 0) {
      // Update existing clap
      claps[existingClapIndex].count += 1;
      claps[existingClapIndex].updatedAt = new Date().toISOString();
      clapData = claps[existingClapIndex];
    } else {
      // Add new clap
      clapData = {
        id: Date.now(),
        articleId,
        textFragment,
        position,
        count: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      claps.push(clapData);
    }

    // Broadcast to all clients connected to this article
    websocketServer.broadcastToArticle(articleId, 'clap', clapData);

    res.status(201).json(clapData);
  });

  // Get annotations for an article
  server.get('/api/articles/:id/annotations', (req, res) => {
    const articleId = parseInt(req.params.id);

    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const annotations = articleAnnotations.get(articleId) || [];
    res.json(annotations);
  });

  // Add an annotation to an article
  server.post('/api/articles/:id/annotations', (req, res) => {
    const articleId = parseInt(req.params.id);

    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const { userId, textFragment, position, note } = req.body;

    if (!userId || !textFragment || !position || !note) {
      return res.status(400).json({
        error: 'Missing required fields: userId, textFragment, position, note'
      });
    }

    // Store the annotation
    if (!articleAnnotations.has(articleId)) {
      articleAnnotations.set(articleId, []);
    }

    // Create annotation object
    const annotationData = {
      id: Date.now(),
      articleId,
      userId,
      textFragment,
      position,
      note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    articleAnnotations.get(articleId).push(annotationData);

    // Broadcast to all clients connected to this article
    websocketServer.broadcastToArticle(articleId, 'annotation', annotationData);

    res.status(201).json(annotationData);
  });

  // Update an annotation
  server.put('/api/articles/:id/annotations',