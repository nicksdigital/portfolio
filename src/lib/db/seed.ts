import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { articles, tags, articleTags } from './schema';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

// In ESM, we need to create __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const { Pool } = pg;

// This script seeds the database with initial data
async function seedDatabase() {
  // Get the database connection string from environment variables
  const connectionString = process.env.DATABASE_URL;

  // Check if the connection string is defined
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  // Create a connection pool
  const pool = new Pool({
    connectionString,
  });

  // Create a Drizzle client
  const db = drizzle(pool, { schema: { articles, tags, articleTags } });

  console.log('Starting database seeding...');

  try {
    console.log('Inserting tags...');
    // Define tags
    const tagData = [
      { name: 'UI/UX' },
      { name: 'Content Strategy' },
      { name: 'Blockchain' },
      { name: 'Quantum Computing' },
      { name: 'LayerBlog' }
    ];

    // Insert tags (outside transaction first)
    const insertedTags = [];
    for (const tag of tagData) {
      try {
        console.log(`Trying to insert tag: ${tag.name}`);
        const [insertedTag] = await db.insert(tags).values(tag).returning();
        insertedTags.push(insertedTag);
        console.log(`Inserted tag: ${tag.name}`);
      } catch (error) {
        if (error.code === '23505') { // Unique violation
          console.log(`Tag ${tag.name} already exists, fetching...`);
          const existingTag = await db.query.tags.findFirst({
            where: (tags, { eq }) => eq(tags.name, tag.name)
          });
          if (existingTag) {
            insertedTags.push(existingTag);
            console.log(`Using existing tag: ${tag.name}`);
          }
        } else {
          console.error(`Error inserting tag ${tag.name}:`, error);
        }
      }
    }

    // Now start a transaction for the articles
    const results = await db.transaction(async (tx) => {

      console.log('Inserting articles...');
      // Article 1: AxiomVerse & LayerBlog
      const [axiomVerseArticle] = await tx.insert(articles).values({
        slug: 'axiomverse-layerblog',
        locale: 'en',
        title: 'AxiomVerse & LayerBlog: Redefining Digital Experiences',
        description: 'Revolutionary approaches to content and decentralized networks using quantum-inspired technologies',
        layers: {
          headline: { 
            content: '<h1>AxiomVerse & LayerBlog: Next-Gen Digital Experiences</h1>' 
          },
          context: { 
            content: '<p>Digital experiences are evolving beyond traditional paradigms, requiring new frameworks for data management, security, and content presentation. This document outlines two interconnected innovations: AxiomVerse, a quantum-inspired decentralized network, and LayerBlog, a revolutionary content platform that gives users control over information depth and engagement.</p>' 
          },
          detail: { 
            content: '<h2>AxiomVerse: Beyond Traditional Blockchain</h2><p>Unlike traditional blockchain\'s linear blocks, AxiomVerse utilizes axioms—complex, multi-dimensional data structures designed to manage intricate transactions and metadata with greater precision.</p><h3>Multi-Layer Composition</h3><ul><li>Each axiom contains multiple layers of data with different access permissions and encryption levels</li><li>Enhanced capacity for storing and processing complex metadata associated with transactions</li><li>Native representation of complex assets</li></ul><h2>LayerBlog: Content with Depth</h2><p>LayerBlog organizes content into distinct layers that users can navigate based on their interest and available time.</p><h3>Multi-Layered Content Architecture</h3><ul><li>Headline Layer: Key points and main takeaways - perfect for quick scanning</li><li>Context Layer: Background information and explanatory content</li><li>Detail Layer: In-depth analysis and technical details</li><li>Discussion Layer: Community insights and author responses</li></ul>' 
          },
          discussion: { 
            content: '<p>What other innovations do you see coming in the digital content space? How might quantum-inspired designs impact user experiences?</p>' 
          }
        },
        date: new Date('2025-04-15'),
        image: '/images/axiomverse-banner.jpg',
        published: true
      }).returning();
      console.log(`Inserted article: ${axiomVerseArticle.title}`);

      // Article 2: LayerBlog Platform
      const [layerBlogArticle] = await tx.insert(articles).values({
        slug: 'layerblog-platform',
        locale: 'en',
        title: 'LayerBlog: Next-Generation Blogging Platform',
        description: 'A multi-layered approach to content with integrated, contextual reader engagement',
        layers: {
          headline: { 
            content: '<h1>LayerBlog: Next-Generation Blogging Platform</h1>' 
          },
          context: { 
            content: '<p>LayerBlog revolutionizes content creation and consumption through a multi-layered approach to content with integrated, contextual reader engagement.</p><h3>Key Innovations:</h3><ol><li>Dynamic Content Layers - Content organized in progressive depth levels</li><li>Contextual Engagement - Readers interact with specific text passages</li><li>Visual Engagement Indicators - Real-time feedback on content resonance</li></ol>' 
          },
          detail: { 
            content: '<h2>Content Layer System</h2><p>Content is organized into four distinct but interconnected layers:</p><ul><li><strong>Headline</strong> - Key points and main takeaways, first layer visible to all readers</li><li><strong>Context</strong> - Background information and definitions, provides necessary context</li><li><strong>Detail</strong> - In-depth analysis and technical information, deep dive for invested readers</li><li><strong>Discussion</strong> - Community insights and author responses, social layer for conversation</li></ul><h2>Micro-Engagement Features</h2><h3>Text-Level Appreciation</h3><p>Allows readers to "clap" for specific text passages they find valuable or insightful</p><h3>Inline Annotations</h3><p>Enables contextual comments tied to specific passages directly within the content</p>' 
          },
          discussion: { 
            content: '<p>How would you use a layered content approach in your projects? What other micro-engagement features would enhance the reading experience?</p>' 
          }
        },
        date: new Date('2025-04-10'),
        image: '/images/layerblog-banner.jpg',
        published: true
      }).returning();
      console.log(`Inserted article: ${layerBlogArticle.title}`);

      // Associate tags with articles
      console.log('Creating article-tag associations...');
      
      // Tags for AxiomVerse article: UI/UX, Content Strategy, Blockchain, Quantum Computing
      await tx.insert(articleTags).values({ 
        articleId: axiomVerseArticle.id, 
        tagId: insertedTags.find(t => t.name === 'UI/UX')!.id 
      });
      
      await tx.insert(articleTags).values({ 
        articleId: axiomVerseArticle.id, 
        tagId: insertedTags.find(t => t.name === 'Content Strategy')!.id 
      });
      
      await tx.insert(articleTags).values({ 
        articleId: axiomVerseArticle.id, 
        tagId: insertedTags.find(t => t.name === 'Blockchain')!.id 
      });
      
      await tx.insert(articleTags).values({ 
        articleId: axiomVerseArticle.id, 
        tagId: insertedTags.find(t => t.name === 'Quantum Computing')!.id 
      });
      
      // Tags for LayerBlog article: UI/UX, Content Strategy, LayerBlog
      await tx.insert(articleTags).values({ 
        articleId: layerBlogArticle.id, 
        tagId: insertedTags.find(t => t.name === 'UI/UX')!.id 
      });
      
      await tx.insert(articleTags).values({ 
        articleId: layerBlogArticle.id, 
        tagId: insertedTags.find(t => t.name === 'Content Strategy')!.id 
      });
      
      await tx.insert(articleTags).values({ 
        articleId: layerBlogArticle.id, 
        tagId: insertedTags.find(t => t.name === 'LayerBlog')!.id 
      });

      console.log('Article-tag associations created successfully');

      return { axiomVerseArticle, layerBlogArticle, insertedTags };
    });

    console.log('Database seeding completed successfully!');
    console.log('Summary:');
    console.log(`- Added ${results.insertedTags.length} tags`);
    console.log(`- Added 2 articles: "${results.axiomVerseArticle.title}" and "${results.layerBlogArticle.title}"`);
    console.log(`- Created article-tag associations`);

  } catch (error) {
    console.error('Database seeding failed:', error);
  } finally {
    await pool.end();
  }

  process.exit(0);
}

seedDatabase().catch((error) => {
  console.error('Seeding error:', error);
  process.exit(1);
});
