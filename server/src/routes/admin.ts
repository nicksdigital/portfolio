import express from 'express';
import { db } from '../db';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { authenticate, authorizeAdmin, authorizeAuthor } from '../middleware/auth';
import crypto from 'crypto';
import { articles, tags, articleTags, users, categories, articleCategories } from '../db/schema';

const router = express.Router();

// Secure all admin routes
//router.use(authenticate);
// router.use(authorizeAuthor);

router.get('/articles/:id', async (req, res) => {
  try {
  /*  if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }*/

      const articleId = parseInt(req.params.id);

     
      const article = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
      });

      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }
      return res.json(article);
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all articles (including unpublished) for admins
router.get('/articles', async (req, res) => {
  try {
    const { locale = 'en', limit = 20, page = 1, showUnpublished = true } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Base query
    let query = db.select().from(articles)
      .where(
        eq(articles.locale, String(locale))
      )
      .orderBy(desc(articles.date))
      .limit(Number(limit))
      .offset(offset);

    // Filter by published status if needed
    if (showUnpublished !== 'true') {
      query = query.where(eq(articles.published, true));
    }

    const result = await query;

    // Get tags for each article
    const articleIds = result.map(article => article.id);


    let articleTagsData: any[] = [];
    let i = 0;
   
    return res.json(result);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new article
router.post('/articles', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const {
      title,
      slug,
      locale = 'en',
      description,
      layers,
      date,
      image,
      published = false,
      tags: tagNames = [],
      categories: categoryIds = []
    } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ message: 'Title and slug are required' });
    }

    // Check if slug is already in use
    const existingArticle = await db.query.articles.findFirst({
      where: and(
        eq(articles.slug, slug),
        eq(articles.locale, locale)
      ),
    });

    if (existingArticle) {
      return res.status(400).json({ message: 'Slug already in use' });
    }

    // Start transaction
    return await db.transaction(async (tx) => {
      // Create article
      const [article] = await tx
        .insert(articles)
        .values({
          title,
          slug,
          locale,
          description,
          layers: layers || {
            headline: { content: '' },
            context: { content: '' },
            detail: { content: '' },
            discussion: { content: '' }
          },
          date: date ? new Date(date) : new Date(),
          image,
          published: Boolean(published),
          authorId: req.user.id,
        })
        .returning();

      // Handle tags
      if (tagNames && tagNames.length > 0) {
        for (const tagName of tagNames) {
          // Check if tag exists
          let tagId;
          const existingTag = await tx.query.tags.findFirst({
            where: eq(tags.name, tagName),
          });

          if (existingTag) {
            tagId = existingTag.id;
          } else {
            // Create tag if it doesn't exist
            const [newTag] = await tx
              .insert(tags)
              .values({ name: tagName })
              .returning();

            tagId = newTag.id;
          }

          // Create article-tag relationship
          await tx
            .insert(articleTags)
            .values({
              articleId: article.id,
              tagId,
            });
        }
      }

      // Handle categories
      if (categoryIds && categoryIds.length > 0) {
        for (const categoryId of categoryIds) {
          // Check if category exists
          const categoryExists = await tx.query.categories.findFirst({
            where: eq(categories.id, categoryId),
          });

          if (categoryExists) {
            // Create article-category relationship
            await tx
              .insert(articleCategories)
              .values({
                articleId: article.id,
                categoryId,
              });
          }
        }
      }

      // Get tags for the article
      const articleTagsData = await tx
        .select({
          name: tags.name,
        })
        .from(articleTags)
        .innerJoin(tags, eq(articleTags.tagId, tags.id))
        .where(eq(articleTags.articleId, article.id));

      return res.status(201).json({
        ...article,
        tags: articleTagsData.map(tag => tag.name),
      });
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update an article
router.put('/articles/:id', async (req, res) => {
  try {
   /* if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }*/

    const articleId = parseInt(req.params.id);

    if (isNaN(articleId)) {
      return res.status(400).json({ message: 'Invalid article ID' });
    }

    const {
      title,
      slug,
      locale,
      description,
      layers,
      date,
      image,
      published,
      tags: tagNames,
      categories: categoryIds,
      featured
    } = req.body;

    // Check if article exists
    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
    });

    if (!existingArticle) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // If user is not admin, check if they are the author
    if (req.user.role !== 'admin' && existingArticle.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }

    // If slug is changing, check if new slug is already in use
    if (slug && slug !== existingArticle.slug) {
      const slugExists = await db.query.articles.findFirst({
        where: and(
          eq(articles.slug, slug),
          eq(articles.locale, locale || existingArticle.locale),
          sql`${articles.id} != ${articleId}`
        ),
      });

      if (slugExists) {
        return res.status(400).json({ message: 'Slug already in use' });
      }
    }

    // Start transaction
    return await db.transaction(async (tx) => {
      // Update article
      const [article] = await tx
        .update(articles)
        .set({
          title: title !== undefined ? title : existingArticle.title,
          slug: slug !== undefined ? slug : existingArticle.slug,
          locale: locale !== undefined ? locale : existingArticle.locale,
          description: description !== undefined ? description : existingArticle.description,
          layers: layers !== undefined ? layers : existingArticle.layers,
          date: date ? new Date(date) : existingArticle.date,
          image: image !== undefined ? image : existingArticle.image,
          published: published !== undefined ? Boolean(published) : existingArticle.published,
          featured: featured !== undefined ? Boolean(featured) : existingArticle.featured,
          updatedAt: new Date(),
        })
        .where(eq(articles.id, articleId))
        .returning();

      // Handle tags if provided
      if (tagNames !== undefined) {
        // Delete existing article-tag relationships
        await tx
          .delete(articleTags)
          .where(eq(articleTags.articleId, articleId));

        // Add new tags
        if (tagNames && tagNames.length > 0) {
          for (const tagName of tagNames) {
            // Check if tag exists
            let tagId;
            const existingTag = await tx.query.tags.findFirst({
              where: eq(tags.name, tagName),
            });

            if (existingTag) {
              tagId = existingTag.id;
            } else {
              // Create tag if it doesn't exist
              const [newTag] = await tx
                .insert(tags)
                .values({ name: tagName })
                .returning();

              tagId = newTag.id;
            }

            // Create article-tag relationship
            await tx
              .insert(articleTags)
              .values({
                articleId: article.id,
                tagId,
              });
          }
        }
      }

      // Handle categories if provided
      if (categoryIds !== undefined) {
        // Delete existing article-category relationships
        await tx
          .delete(articleCategories)
          .where(eq(articleCategories.articleId, articleId));

        // Add new categories
        if (categoryIds && categoryIds.length > 0) {
          for (const categoryId of categoryIds) {
            // Check if category exists
            const categoryExists = await tx.query.categories.findFirst({
              where: eq(categories.id, categoryId),
            });

            if (categoryExists) {
              // Create article-category relationship
              await tx
                .insert(articleCategories)
                .values({
                  articleId: article.id,
                  categoryId,
                });
            }
          }
        }
      }

      // Get tags for the article
      const articleTagsData = await tx
        .select({
          name: tags.name,
        })
        .from(articleTags)
        .innerJoin(tags, eq(articleTags.tagId, tags.id))
        .where(eq(articleTags.articleId, article.id));

      return res.json({
        ...article,
        tags: articleTagsData.map(tag => tag.name),
      });
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get article by slug
router.get('/articles/slug/:slug', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { slug } = req.params;
    const { locale = 'en' } = req.query;

    // Find article by slug
    const article = await db.query.articles.findFirst({
      where: and(
        eq(articles.slug, slug),
        eq(articles.locale, String(locale))
      ),
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // If user is not admin, check if they are the author or if article is published
    if (req.user.role !== 'admin' && article.authorId !== req.user.id && !article.published) {
      return res.status(403).json({ message: 'Not authorized to view this article' });
    }

    // Get tags for the article
    const articleTagsData = await db
      .select({
        name: tags.name,
      })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
      .where(eq(articleTags.articleId, article.id));

    // Get categories for the article
    const articleCategoriesData = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(articleCategories)
      .innerJoin(categories, eq(articleCategories.categoryId, categories.id))
      .where(eq(articleCategories.articleId, article.id));

    return res.json({
      ...article,
      tags: articleTagsData.map(tag => tag.name),
      categories: articleCategoriesData.map(category => category.id),
      categoryDetails: articleCategoriesData,
    });
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add publish/unpublish endpoint
router.put('/articles/:id/publish', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const articleId = parseInt(req.params.id);
    const { published } = req.body;

    if (isNaN(articleId)) {
      return res.status(400).json({ message: 'Invalid article ID' });
    }

    // Check if article exists
    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
    });

    if (!existingArticle) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // If user is not admin, check if they are the author
    if (req.user.role !== 'admin' && existingArticle.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }

    // Update article published status
    const [article] = await db
      .update(articles)
      .set({
        published: Boolean(published),
        updatedAt: new Date(),
      })
      .where(eq(articles.id, articleId))
      .returning();

    // Get tags for the article
    const articleTagsData = await db
      .select({
        name: tags.name,
      })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
      .where(eq(articleTags.articleId, article.id));

    return res.json({
      ...article,
      tags: articleTagsData.map(tag => tag.name),
    });
  } catch (error) {
    console.error('Error updating article publish status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete an article
router.delete('/articles/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const articleId = parseInt(req.params.id);

    if (isNaN(articleId)) {
      return res.status(400).json({ message: 'Invalid article ID' });
    }

    // Check if article exists
    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
    });

    if (!existingArticle) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // If user is not admin, check if they are the author
    if (req.user.role !== 'admin' && existingArticle.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }

    // Delete article (cascade will delete related records)
    const [result] = await db
      .delete(articles)
      .where(eq(articles.id, articleId))
      .returning();

    return res.json({
      message: 'Article deleted successfully',
      article: result
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await db.select().from(categories).orderBy(categories.name);
    return res.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new category
router.post('/categories', authorizeAdmin, async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required' });
    }

    // Check if category already exists
    const existingCategory = await db.query.categories.findFirst({
      where:
        eq(categories.slug, slug)
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }

    // Create category
    const [result] = await db
      .insert(categories)
      .values({
        name,
        slug,
        description,
      })
      .returning();

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a category
router.put('/categories/:id', authorizeAdmin, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const { name, slug, description } = req.body;

    // Check if category exists
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });

    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // If slug is changing, check if new slug is already in use
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await db.query.categories.findFirst({
        where: and(
          eq(categories.slug, slug),
          sql`${categories.id} != ${categoryId}`
        ),
      });

      if (slugExists) {
        return res.status(400).json({ message: 'Slug already in use' });
      }
    }

    // Update category
    const [result] = await db
      .update(categories)
      .set({
        name: name !== undefined ? name : existingCategory.name,
        slug: slug !== undefined ? slug : existingCategory.slug,
        description: description !== undefined ? description : existingCategory.description,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, categoryId))
      .returning();

    return res.json(result);
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a category
router.delete('/categories/:id', authorizeAdmin, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    // Check if category exists
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });

    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete category
    const [result] = await db
      .delete(categories)
      .where(eq(categories.id, categoryId))
      .returning();

    return res.json({
      message: 'Category deleted successfully',
      category: result
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all tags
router.get('/tags', async (req, res) => {
  try {
    const result = await db.select().from(tags).orderBy(tags.name);
    return res.json(result);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin-only routes for user management
router.use(authorizeAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: (users, { asc }) => [asc(users.email)],
    });

    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new user (admin only)
router.post('/users', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'author' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    const passwordWithSalt = `${salt}:${hashedPassword}`;

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        email,
        password: passwordWithSalt,
        firstName,
        lastName,
        role,
      })
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a user
router.put('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const { email, firstName, lastName, role, isActive, password } = req.body;

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If email is changing, check if new email is already in use
    if (email && email !== existingUser.email) {
      const emailExists = await db.query.users.findFirst({
        where: and(
          eq(users.email, email),
          sql`${users.id} != ${userId}`
        ),
      });

      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Prepare update values
    const updateValues: any = {
      firstName: firstName !== undefined ? firstName : existingUser.firstName,
      lastName: lastName !== undefined ? lastName : existingUser.lastName,
      email: email !== undefined ? email : existingUser.email,
      role: role !== undefined ? role : existingUser.role,
      isActive: isActive !== undefined ? isActive : existingUser.isActive,
      updatedAt: new Date(),
    };

    // Hash password if provided
    if (password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
        .toString('hex');
      updateValues.password = `${salt}:${hashedPassword}`;
    }

    // Update user
    const [user] = await db
      .update(users)
      .set(updateValues)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        updatedAt: users.updatedAt,
      });

    return res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting yourself
    if (userId === req.user?.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete user
    const [result] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
      });

    return res.json({
      message: 'User deleted successfully',
      user: result
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get article count
    const articlesCount = await db
      .select({ count: sql`count(*)` })
      .from(articles);

    // Get published article count
    const publishedArticlesCount = await db
      .select({ count: sql`count(*)` })
      .from(articles)
      .where(eq(articles.published, true));

    // Get tag count
    const tagsCount = await db
      .select({ count: sql`count(*)` })
      .from(tags);

    // Get user count
    const usersCount = await db
      .select({ count: sql`count(*)` })
      .from(users);

    // Get total view count
    const viewsResult = await db
      .select({ totalViews: sql`sum(${articles.viewCount})` })
      .from(articles);

    // Get most viewed articles
    const mostViewedArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        viewCount: articles.viewCount,
      })
      .from(articles)
      .orderBy(desc(articles.viewCount))
      .limit(5);

    // Get most used tags
    const mostUsedTags = await db
      .select({
        tagId: tags.id,
        tagName: tags.name,
        count: sql`count(${articleTags.tagId})`,
      })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
      .groupBy(tags.id, tags.name)
      .orderBy(desc(sql`count(${articleTags.tagId})`))
      .limit(5);

    return res.json({
      articles: {
        total: Number(articlesCount[0].count),
        published: Number(publishedArticlesCount[0].count),
        views: Number(viewsResult[0].totalViews) || 0,
        mostViewed: mostViewedArticles,
      },
      tags: {
        total: Number(tagsCount[0].count),
        mostUsed: mostUsedTags,
      },
      users: {
        total: Number(usersCount[0].count),
      },
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
