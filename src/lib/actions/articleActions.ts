'use server';

import {
  getArticlesByLocale as getArticlesByLocaleRepo,
  getArticleBySlug as getArticleBySlugRepo,
  getArticleSlugs as getArticleSlugsRepo,
  createArticle as createArticleRepo,
  updateArticle as updateArticleRepo,
  deleteArticle as deleteArticleRepo,
  ArticleData
} from '@/lib/db/repositories/articleRepository';

import {
  addClap as addClapRepo,
  getClapsForArticle as getClapsForArticleRepo,
  getClapsForArticleBySlug as getClapsForArticleBySlugRepo,
  ClapData
} from '@/lib/db/repositories/clapRepository';

import {
  addAnnotation as addAnnotationRepo,
  getAnnotationsForArticle as getAnnotationsForArticleRepo,
  getAnnotationsForArticleBySlug as getAnnotationsForArticleBySlugRepo,
  updateAnnotation as updateAnnotationRepo,
  deleteAnnotation as deleteAnnotationRepo,
  AnnotationData
} from '@/lib/db/repositories/annotationRepository';

// Server actions for articles
export async function getArticlesByLocale(locale: string) {
  return await getArticlesByLocaleRepo(locale);
}

export async function getArticleBySlug(slug: string, locale: string) {
  return await getArticleBySlugRepo(slug, locale);
}

export async function getArticleSlugs(locale: string) {
  return await getArticleSlugsRepo(locale);
}

export async function createArticle(data: ArticleData) {
  return await createArticleRepo(data);
}

export async function updateArticle(slug: string, locale: string, data: Partial<ArticleData>) {
  return await updateArticleRepo(slug, locale, data);
}

export async function deleteArticle(slug: string, locale: string) {
  return await deleteArticleRepo(slug, locale);
}

// Server actions for claps
export async function addClap(data: ClapData) {
  return await addClapRepo(data);
}

export async function getClapsForArticle(articleId: number) {
  return await getClapsForArticleRepo(articleId);
}

export async function getClapsForArticleBySlug(slug: string, locale: string) {
  return await getClapsForArticleBySlugRepo(slug, locale);
}

// Server actions for annotations
export async function addAnnotation(data: AnnotationData) {
  return await addAnnotationRepo(data);
}

export async function getAnnotationsForArticle(articleId: number) {
  return await getAnnotationsForArticleRepo(articleId);
}

export async function getAnnotationsForArticleBySlug(slug: string, locale: string) {
  return await getAnnotationsForArticleBySlugRepo(slug, locale);
}

export async function updateAnnotation(id: number, note: string) {
  return await updateAnnotationRepo(id, note);
}

export async function deleteAnnotation(id: number) {
  return await deleteAnnotationRepo(id);
}
