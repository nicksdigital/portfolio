import express from 'express';
import { db } from '../db';
import { articles, claps, annotations, tags, articleTags } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authenticate, authorizeAuthor } from '../middleware/auth';

const router = express.Router();

// Get all articles (published only, for public)
router.get('/', async (req, res) => {
  try {
    const { locale = 'en', limit = 10, page = 1, category = '', tag = '' } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    // Base query
    let query = db.select().from(articles)
      .where(
        and(
          eq(articles.published, true),
          eq(articles.locale, String(locale))
        )
      )
      .orderBy(desc(articles.date))
      .limit(Number(limit))
      .offset(offset);
    
    // Apply tag filter if provided
    if (tag) {
      query = query
        .innerJoin(
          articleTags,
          eq(articles.id, articleTags.articleId)
        )
        .innerJoin(
          tags,
          eq(articleTags.tagId, tags.id)
        )
        .where(
          eq(tags.name, String(tag))
        );
    }
    
    const result = await query;
    
    // Get tags for each article
    const articleIds = result.map(article => article.id);
    
    let articleTagsData = [];
    if (articleIds.length > 0) {
      articleTagsData = await db
        .select({
          articleId: articleTags.articleId,
          tagName: tags.name,
        })
        .from(articleTags)
        .innerJoin(tags, eq(articleTags.tagId, tags.id))
        .where(sql`${articleTags.articleId} IN (${articleIds.join(',')})`);
    }
    
    // Group tags by article ID
    const tagsByArticleId = articleTagsData.reduce((acc, { articleId, tagName }) => {
      if (!acc[articleId]) {
        acc[articleId] = [];
      }
      acc[articleId].push(tagName);
      return acc;
    }, {} as Record<number, string[]>);
    
    // Add tags to each article
    const articlesWithTags = result.map(article => ({
      ...article,
      tags: tagsByArticleId[article.id] || [],
    }));
    
    return res.json(articlesWithTags);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific article by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { locale = 'en' } = req.query;
    
    const article = await db.query.articles.findFirst({
      where: and(
        eq(articles.slug, slug),
        eq(articles.locale, String(locale))
      ),
    });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Get tags for the article
    const tagsResult = await db
      .select({
        name: tags.name,
      })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
      .where(eq(articleTags.articleId, article.id));
    
    // Update view count
    await db
      .update(articles)
      .set({
        viewCount: article.viewCount + 1,
      })
      .where(eq(articles.id, article.id));
    
    return res.json({
      ...article,
      tags: tagsResult.map(tag => tag.name),
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all claps for an article
router.get('/:id/claps', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    
    if (isNaN(articleId)) {
      return res.status(400).json({ message: 'Invalid article ID' });
    }
    
    const result = await db.select().from(claps)
      .where(eq(claps.articleId, articleId));
    
    return res.json(result);
  } catch (error) {
    console.error('Error fetching claps:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a clap to an article
router.post('/:id/claps', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    
    if (isNaN(articleId)) {
      return res.status(400).json({ message: 'Invalid article ID' });
    }
    
    const { textFragment, position } = req.body;
    
    if (!textFragment || !position) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if this text fragment already has claps
    const existingClap = await db.query.claps.findFirst({
      where: and(
        eq(claps.articleId, articleId),
        eq(claps.textFragment, textFragment)
      ),
    });
    
    let result;
    
    if (existingClap) {
      // Increment the clap count
      [result] = await db
        .update(claps)
        .set({
          count: existingClap.count + 1,
          updatedAt: new Date(),
        })
        .where(eq(claps.id, existingClap.id))
        .returning();
    } else {
      // Create a new clap
      [result] = await db
        .insert(claps)
        .values({
          articleId,
          textFragment,
          position,
          count: 1,
        })
        .returning();
    }
    
    return res.status(existingClap ? 200 : 201).json(result);
  } catch (error) {
    console.error('Error adding clap:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all annotations for an article
router.get('/:id/annotations', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    
    if (isNaN(articleId)) {
      return res.status(400).json({ message: 'Invalid article ID' });
    }
    
    const result = await db.select().from(annotations)
      .where(eq(annotations.articleId, articleId))
      .orderBy(desc(annotations.createdAt));
    
    return res.json(result);
  } catch (error) {
    console.error('Error fetching annotations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add an annotation to an article
router.post('/:id/annotations', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    
    if (isNaN(articleId)) {
      return res.status(400).json({ message: 'Invalid article ID' });
    }
    
    const { userId, textFragment, position, note } = req.body;
    
    if (!userId || !textFragment || !position || !note) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Create a new annotation
    const [result] = await db
      .insert(annotations)
      .values({
        articleId,
        userId,
        textFragment,
        position,
        note,
      })
      .returning();
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error adding annotation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update an annotation
router.put('/:id/annotations/:annotationId', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const annotationId = parseInt(req.params.annotationId);
    
    if (isNaN(articleId) || isNaN(annotationId)) {
      return res.status(400).json({ message: 'Invalid article ID or annotation ID' });
    }
    
    const { note, userId } = req.body;
    
    if (!note) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Find the annotation
    const existingAnnotation = await db.query.annotations.findFirst({
      where: and(
        eq(annotations.id, annotationId),
        eq(annotations.articleId, articleId)
      ),
    });
    
    if (!existingAnnotation) {
      return res.status(404).json({ message: 'Annotation not found' });
    }
    
    // Check if the user is the owner of the annotation
    if (existingAnnotation.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this annotation' });
    }
    
    // Update the annotation
    const [result] = await db
      .update(annotations)
      .set({
        note,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(annotations.id, annotationId),
          eq(annotations.articleId, articleId)
        )
      )
      .returning();
    
    return res.json(result);
  } catch (error) {
    console.error('Error updating annotation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete an annotation
router.delete('/:id/annotations/:annotationId', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const annotationId = parseInt(req.params.annotationId);
    const { userId } = req.query;
    
    if (isNaN(articleId) || isNaN(annotationId)) {
      return res.status(400).json({ message: 'Invalid article ID or annotation ID' });
    }
    
    // Find the annotation
    const existingAnnotation = await db.query.annotations.findFirst({
      where: and(
        eq(annotations.id, annotationId),
        eq(annotations.articleId, articleId)
      ),
    });
    
    if (!existingAnnotation) {
      return res.status(404).json({ message: 'Annotation not found' });
    }
    
    // Check if the user is the owner of the annotation
    if (existingAnnotation.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this annotation' });
    }
    
    // Delete the annotation
    const [result] = await db
      .delete(annotations)
      .where(
        and(
          eq(annotations.id, annotationId),
          eq(annotations.articleId, articleId)
        )
      )
      .returning();
    
    return res.json(result);
  } catch (error) {
    console.error('Error deleting annotation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
