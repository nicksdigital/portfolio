import { pgTable, serial, text, timestamp, boolean, varchar, jsonb, integer } from 'drizzle-orm/pg-core';

// Define the articles table with layers
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  locale: varchar('locale', { length: 10 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  // Layers content
  layers: jsonb('layers').notNull().default({
    headline: { content: '' },
    context: { content: '' },
    detail: { content: '' },
    discussion: { content: '' }
  }),
  date: timestamp('date').defaultNow().notNull(),
  image: text('image'),
  published: boolean('published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define the tags table
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define the article_tags junction table
export const articleTags = pgTable('article_tags', {
  id: serial('id').primaryKey(),
  articleId: serial('article_id').references(() => articles.id).notNull(),
  tagId: serial('tag_id').references(() => tags.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define the claps table for text-level appreciation
export const claps = pgTable('claps', {
  id: serial('id').primaryKey(),
  articleId: serial('article_id').references(() => articles.id).notNull(),
  textFragment: text('text_fragment').notNull(),
  position: jsonb('position').notNull(), // { startOffset, endOffset }
  count: integer('count').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define the annotations table for inline comments
export const annotations = pgTable('annotations', {
  id: serial('id').primaryKey(),
  articleId: serial('article_id').references(() => articles.id).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  textFragment: text('text_fragment').notNull(),
  position: jsonb('position').notNull(), // { startOffset, endOffset }
  note: text('note').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
