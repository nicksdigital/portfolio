import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  varchar,
  jsonb,
  integer,
  primaryKey
} from 'drizzle-orm/pg-core';

// Users table (for admin, authors)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Articles table
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
  authorId: integer('author_id').references(() => users.id),
  featured: boolean('featured').default(false).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Article Categories table (many-to-many)
export const articleCategories = pgTable('article_categories', {
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  // Add a composite primary key constraint
  id: serial('id').primaryKey(),
});

// Tags table
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Article Tags table (many-to-many)
export const articleTags = pgTable('article_tags', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Claps table for text-level appreciation
export const claps = pgTable('claps', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  textFragment: text('text_fragment').notNull(),
  position: jsonb('position').notNull(), // { startOffset, endOffset }
  count: integer('count').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Annotations table for inline comments
export const annotations = pgTable('annotations', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull(),
  textFragment: text('text_fragment').notNull(),
  position: jsonb('position').notNull(), // { startOffset, endOffset }
  note: text('note').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions table for authentication
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull(),
  expires: timestamp('expires').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
