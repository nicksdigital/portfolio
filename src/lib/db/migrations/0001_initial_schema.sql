CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  locale VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  layers JSONB NOT NULL DEFAULT '{"headline": {"content": ""}, "context": {"content": ""}, "detail": {"content": ""}, "discussion": {"content": ""}}',
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  image TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS article_tags (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS claps (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  text_fragment TEXT NOT NULL,
  position JSONB NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS annotations (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  text_fragment TEXT NOT NULL,
  position JSONB NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS articles_locale_idx ON articles(locale);
CREATE INDEX IF NOT EXISTS articles_slug_locale_idx ON articles(slug, locale);
CREATE INDEX IF NOT EXISTS article_tags_article_id_idx ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS article_tags_tag_id_idx ON article_tags(tag_id);
CREATE INDEX IF NOT EXISTS claps_article_id_idx ON claps(article_id);
CREATE INDEX IF NOT EXISTS annotations_article_id_idx ON annotations(article_id);
CREATE INDEX IF NOT EXISTS annotations_user_id_idx ON annotations(user_id);
