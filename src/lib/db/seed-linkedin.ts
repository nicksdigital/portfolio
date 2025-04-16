import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { articles, tags, articleTags } from './schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { JSDOM } from 'jsdom';

// Load environment variables from .env file
dotenv.config();

const { Pool } = pg;

// In ESM, we need to create __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to extract content from LinkedIn HTML files
function extractLinkedInArticle(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Extract title
  const titleElement = document.querySelector('h1 a');
  const title = titleElement ? titleElement.textContent : 'Untitled Article';
  
  // Extract date
  const publishedElement = document.querySelector('.published');
  const published = publishedElement ? publishedElement.textContent.replace('Published on ', '') : '';
  
  // Create date object from the published date
  const dateMatch = published.match(/(\d{4})-(\d{2})-(\d{2})/);
  const date = dateMatch ? new Date(dateMatch[1], parseInt(dateMatch[2]) - 1, dateMatch[3]) : new Date();
  
  // Extract content
  const contentDiv = document.querySelector('div');
  
  // Extract headline content (first h1 or h2)
  const headlineElement = contentDiv?.querySelector('h1, h2');
  const headline = headlineElement ? 
    { content: `<h1>${headlineElement.textContent}</h1>` } : 
    { content: `<h1>${title}</h1>` };
  
  // Extract first paragraph as context
  const paragraphs = contentDiv?.querySelectorAll('p');
  const contextParagraph = paragraphs && paragraphs.length > 0 ? paragraphs[0] : null;
  const context = contextParagraph ? 
    { content: `<p>${contextParagraph.textContent}</p>` } : 
    { content: '' };
  
  // Get all content as detail
  let detailContent = '';
  if (contentDiv) {
    // Clone the content to avoid modifying the original
    const clonedContent = contentDiv.cloneNode(true);
    // Convert the content to HTML
    detailContent = clonedContent.innerHTML;
  }
  const detail = { content: detailContent };
  
  // Add a generic discussion prompt
  const discussion = { 
    content: `<p>What are your thoughts on this article? Do you have any questions or insights to share?</p>` 
  };
  
  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
  
  // Extract tags from content - look for keywords or headings
  const possibleTags = new Set();
  const headings = contentDiv?.querySelectorAll('h2, h3');
  headings?.forEach(heading => {
    const text = heading.textContent;
    if (text) {
      // Split heading into potential tag words and add those with length > 3
      text.split(/\s+/).forEach(word => {
        if (word.length > 3 && !word.match(/^(and|the|for|with|this|that|from|have|about)$/i)) {
          possibleTags.add(word.replace(/[^\w]/g, ''));
        }
      });
    }
  });
  
  // Extract any emphasized words as tags
  const emphasized = contentDiv?.querySelectorAll('strong, em, b, i');
  emphasized?.forEach(em => {
    const text = em.textContent;
    if (text && text.length > 3 && text.length < 20) {
      possibleTags.add(text.replace(/[^\w\s]/g, '').trim());
    }
  });
  
  // Filter tags and limit to 5
  const tags = Array.from(possibleTags)
    .filter(tag => tag.length > 0)
    .slice(0, 5);
  
  // Extract the first image URL if any
  const imageElement = document.querySelector('img[src^="https://media.licdn.com"]');
  const image = imageElement ? imageElement.src : null;
  
  return {
    title,
    slug,
    date,
    layers: {
      headline,
      context,
      detail,
      discussion
    },
    description: contextParagraph ? contextParagraph.textContent.substring(0, 200) + '...' : '',
    tags,
    image
  };
}

// This script seeds the database with LinkedIn articles
async function seedLinkedInArticles() {
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

  console.log('Starting LinkedIn articles import...');

  try {
    const linkedInDir = '/Users/nick/Basic_LinkedInDataExport_04-15-2025/Articles/Articles';
    const files = fs.readdirSync(linkedInDir)
      .filter(file => file.endsWith('.html'))
      .filter(file => !file.includes('Be proud of who you are')); // Skip this specific file
    
    console.log(`Found ${files.length} LinkedIn articles`);
    
    // Process files in batches of 5 to avoid overwhelming the database
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }
    
    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`Processing batch ${batchIndex + 1} of ${batches.length}...`);
      
      for (const file of batch) {
        const filePath = path.join(linkedInDir, file);
        console.log(`Extracting content from ${file}...`);
        
        try {
          const articleData = extractLinkedInArticle(filePath);
          console.log(`Processing article: ${articleData.title}`);
          
          // Insert tags first
          const insertedTags = [];
          for (const tagName of articleData.tags) {
            try {
              const [insertedTag] = await db.insert(tags)
                .values({ name: tagName })
                .returning();
              
              insertedTags.push(insertedTag);
              console.log(`Inserted tag: ${tagName}`);
            } catch (error) {
              if (error.code === '23505') { // Unique violation
                // Tag already exists, fetch it
                const existingTag = await db.query.tags.findFirst({
                  where: (tags, { eq }) => eq(tags.name, tagName)
                });
                
                if (existingTag) {
                  insertedTags.push(existingTag);
                  console.log(`Using existing tag: ${tagName}`);
                }
              } else {
                console.error(`Error inserting tag ${tagName}:`, error);
              }
            }
          }
          
          // Check if article with same slug already exists
          const existingArticle = await db.query.articles.findFirst({
            where: (articles, { eq }) => eq(articles.slug, articleData.slug)
          });
          
          if (existingArticle) {
            console.log(`Article with slug "${articleData.slug}" already exists. Skipping.`);
            continue;
          }
          
          // Insert the article
          const [article] = await db.insert(articles)
            .values({
              slug: articleData.slug,
              locale: 'en',
              title: articleData.title,
              description: articleData.description,
              layers: articleData.layers,
              date: articleData.date,
              image: articleData.image,
              published: true
            })
            .returning();
          
          console.log(`Inserted article: ${article.title}`);
          
          // Associate tags with the article
          for (const tag of insertedTags) {
            await db.insert(articleTags)
              .values({
                articleId: article.id,
                tagId: tag.id
              });
          }
          
          console.log(`Associated ${insertedTags.length} tags with article`);
        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
        }
      }
      
      // Add a small delay between batches to prevent overloading
      if (batchIndex < batches.length - 1) {
        console.log('Waiting before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('LinkedIn articles import completed successfully!');
  } catch (error) {
    console.error('LinkedIn articles import failed:', error);
  } finally {
    await pool.end();
  }

  process.exit(0);
}

seedLinkedInArticles().catch((error) => {
  console.error('Seeding error:', error);
  process.exit(1);
});
