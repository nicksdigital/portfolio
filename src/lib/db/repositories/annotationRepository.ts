import { db } from '@/lib/db';
import { annotations, articles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export interface AnnotationData {
  articleId: number;
  userId: string;
  textFragment: string;
  position: {
    startOffset: number;
    endOffset: number;
  };
  note: string;
}

// Add an annotation to a specific text fragment
export async function addAnnotation(data: AnnotationData) {
  const [newAnnotation] = await db
    .insert(annotations)
    .values({
      articleId: data.articleId,
      userId: data.userId,
      textFragment: data.textFragment,
      position: data.position,
      note: data.note,
    })
    .returning();

  return newAnnotation;
}

// Get all annotations for a specific article
export async function getAnnotationsForArticle(articleId: number) {
  return await db.query.annotations.findMany({
    where: eq(annotations.articleId, articleId),
    orderBy: (annotations, { desc }) => [desc(annotations.createdAt)],
  });
}

// Get all annotations for a specific article by slug and locale
export async function getAnnotationsForArticleBySlug(slug: string, locale: string) {
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

  // Then get the annotations
  return await getAnnotationsForArticle(article.id);
}

// Update an annotation
export async function updateAnnotation(id: number, note: string) {
  const [updatedAnnotation] = await db
    .update(annotations)
    .set({
      note,
      updatedAt: new Date(),
    })
    .where(eq(annotations.id, id))
    .returning();

  return updatedAnnotation;
}

// Delete an annotation
export async function deleteAnnotation(id: number) {
  const [deletedAnnotation] = await db
    .delete(annotations)
    .where(eq(annotations.id, id))
    .returning();

  return deletedAnnotation;
}
