import { db } from '@/lib/db';
import { claps, articles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export interface ClapData {
  articleId: number;
  textFragment: string;
  position: {
    startOffset: number;
    endOffset: number;
  };
}

// Add a clap to a specific text fragment
export async function addClap(data: ClapData) {
  // Check if this text fragment already has claps
  const existingClap = await db.query.claps.findFirst({
    where: and(
      eq(claps.articleId, data.articleId),
      eq(claps.textFragment, data.textFragment)
    ),
  });

  if (existingClap) {
    // Increment the existing clap count
    const [updatedClap] = await db
      .update(claps)
      .set({
        count: existingClap.count + 1,
        updatedAt: new Date(),
      })
      .where(eq(claps.id, existingClap.id))
      .returning();

    return updatedClap;
  } else {
    // Add a new clap
    const [newClap] = await db
      .insert(claps)
      .values({
        articleId: data.articleId,
        textFragment: data.textFragment,
        position: data.position,
        count: 1,
      })
      .returning();

    return newClap;
  }
}

// Get all claps for a specific article
export async function getClapsForArticle(articleId: number) {
  return await db.query.claps.findMany({
    where: eq(claps.articleId, articleId),
    orderBy: (claps, { desc }) => [desc(claps.count)],
  });
}

// Get all claps for a specific article by slug and locale
export async function getClapsForArticleBySlug(slug: string, locale: string) {
  // First, find the article
  const article = await db.query.articles.findFirst({
    where: and(
      eq(articles.slug, slug),
      eq(articles.locale, locale)
    ),
  });

  if (!article) {
    throw new Error(`Article not found: ${slug} (${locale})`);
  }

  // Then get the claps
  return await getClapsForArticle(article.id);
}
