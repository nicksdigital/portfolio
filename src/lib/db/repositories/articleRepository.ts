import { db } from '@/lib/db';
import { articles, tags, articleTags } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export interface ArticleData {
  slug: string;
  locale: string;
  title: string;
  description?: string;
  layers: {
    headline: { content: string };
    context: { content: string };
    detail: { content: string };
    discussion: { content: string };
  };
  date?: Date;
  image?: string;
  published?: boolean;
  tags?: string[];
}

// Get all articles for a specific locale
export async function getArticlesByLocale(locale: string) {
  const result = await db.query.articles.findMany({
    where: and(
      eq(articles.locale, locale),
      eq(articles.published, true)
    ),
    orderBy: (articles, { desc }) => [desc(articles.date)],
  });

  // Get tags for each article
  const articleIds = result.map(article => article.id);

  if (articleIds.length === 0) {
    return result.map(article => ({
      ...article,
      tags: [],
    }));
  }

  const tagsResult = await db
    .select({
      articleId: articleTags.articleId,
      tagName: tags.name,
    })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(inArray(articleTags.articleId, articleIds));

  // Group tags by article ID
  const tagsByArticleId = tagsResult.reduce((acc, { articleId, tagName }) => {
    if (!acc[articleId]) {
      acc[articleId] = [];
    }
    acc[articleId].push(tagName);
    return acc;
  }, {} as Record<number, string[]>);

  // Add tags to each article
  return result.map(article => ({
    ...article,
    tags: tagsByArticleId[article.id] || [],
  }));
}

// Get a specific article by slug and locale
export async function getArticleBySlug(slug: string, locale: string) {
  const result = await db.query.articles.findFirst({
    where: and(
      eq(articles.slug, slug),
      eq(articles.locale, locale)
    ),
  });

  if (!result) {
    throw new Error(`Article not found: ${slug} (${locale})`);
  }

  // Get tags for the article
  const tagsResult = await db
    .select({
      tagName: tags.name,
    })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, result.id));

  return {
    ...result,
    tags: tagsResult.map(tag => tag.tagName),
  };
}

// Get all article slugs for a specific locale
export async function getArticleSlugs(locale: string) {
  const result = await db
    .select({ slug: articles.slug })
    .from(articles)
    .where(and(
      eq(articles.locale, locale),
      eq(articles.published, true)
    ));

  return result.map(row => row.slug);
}

// Create a new article
export async function createArticle(data: ArticleData) {
  // Start a transaction
  return await db.transaction(async (tx) => {
    // Insert the article
    const [article] = await tx
      .insert(articles)
      .values({
        slug: data.slug,
        locale: data.locale,
        title: data.title,
        description: data.description,
        layers: data.layers || {
          headline: { content: '' },
          context: { content: '' },
          detail: { content: '' },
          discussion: { content: '' }
        },
        date: data.date ? new Date(data.date) : new Date(),
        image: data.image,
        published: data.published !== undefined ? data.published : true,
      })
      .returning();

    // If there are tags, insert them
    if (data.tags && data.tags.length > 0) {
      // Insert tags (ignoring duplicates)
      for (const tagName of data.tags) {
        try {
          // Try to insert the tag
          const [tag] = await tx
            .insert(tags)
            .values({ name: tagName })
            .returning();

          // Create the article-tag relationship
          await tx
            .insert(articleTags)
            .values({
              articleId: article.id,
              tagId: tag.id,
            });
        } catch (error) {
          // If the tag already exists, get its ID
          const existingTag = await tx.query.tags.findFirst({
            where: eq(tags.name, tagName),
          });

          if (existingTag) {
            // Create the article-tag relationship
            await tx
              .insert(articleTags)
              .values({
                articleId: article.id,
                tagId: existingTag.id,
              });
          }
        }
      }
    }

    return article;
  });
}

// Update an existing article
export async function updateArticle(slug: string, locale: string, data: Partial<ArticleData>) {
  // Start a transaction
  return await db.transaction(async (tx) => {
    // Find the article
    const existingArticle = await tx.query.articles.findFirst({
      where: and(
        eq(articles.slug, slug),
        eq(articles.locale, locale)
      ),
    });

    if (!existingArticle) {
      throw new Error(`Article not found: ${slug} (${locale})`);
    }

    // Update the article
    const [updatedArticle] = await tx
      .update(articles)
      .set({
        title: data.title !== undefined ? data.title : existingArticle.title,
        description: data.description !== undefined ? data.description : existingArticle.description,
        layers: data.layers !== undefined ? data.layers : existingArticle.layers,
        date: data.date ? new Date(data.date) : existingArticle.date,
        image: data.image !== undefined ? data.image : existingArticle.image,
        published: data.published !== undefined ? data.published : existingArticle.published,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, existingArticle.id))
      .returning();

    // If there are tags, update them
    if (data.tags) {
      // Delete existing article-tag relationships
      await tx
        .delete(articleTags)
        .where(eq(articleTags.articleId, existingArticle.id));

      // Insert new tags
      for (const tagName of data.tags) {
        try {
          // Try to insert the tag
          const [tag] = await tx
            .insert(tags)
            .values({ name: tagName })
            .returning();

          // Create the article-tag relationship
          await tx
            .insert(articleTags)
            .values({
              articleId: existingArticle.id,
              tagId: tag.id,
            });
        } catch (error) {
          // If the tag already exists, get its ID
          const existingTag = await tx.query.tags.findFirst({
            where: eq(tags.name, tagName),
          });

          if (existingTag) {
            // Create the article-tag relationship
            await tx
              .insert(articleTags)
              .values({
                articleId: existingArticle.id,
                tagId: existingTag.id,
              });
          }
        }
      }
    }

    return updatedArticle;
  });
}

// Delete an article
export async function deleteArticle(slug: string, locale: string) {
  // Start a transaction
  return await db.transaction(async (tx) => {
    // Find the article
    const existingArticle = await tx.query.articles.findFirst({
      where: and(
        eq(articles.slug, slug),
        eq(articles.locale, locale)
      ),
    });

    if (!existingArticle) {
      throw new Error(`Article not found: ${slug} (${locale})`);
    }

    // Delete the article (cascade will delete article-tag relationships)
    await tx
      .delete(articles)
      .where(eq(articles.id, existingArticle.id));

    return existingArticle;
  });
}
