import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createArticle } from '@/lib/actions/articleActions';

// Define the content directory
const contentDirectory = path.join(process.cwd(), 'content');

// Import MDX files into the database
async function importMdxFiles() {
  const locales = ['en', 'fr'];

  for (const locale of locales) {
    const articlesDirectory = path.join(contentDirectory, 'articles', locale);

    // Check if directory exists
    if (!fs.existsSync(articlesDirectory)) {
      console.warn(`Articles directory for locale '${locale}' does not exist: ${articlesDirectory}`);
      continue;
    }

    const files = fs.readdirSync(articlesDirectory);

    for (const file of files) {
      if (!file.endsWith('.mdx')) {
        continue;
      }

      const slug = file.replace(/\.mdx$/, '');
      const filePath = path.join(articlesDirectory, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);

      try {
        // Create the article in the database
        await createArticle({
          slug,
          locale,
          title: data.title || '',
          description: data.description || '',
          content,
          date: data.date ? new Date(data.date) : new Date(),
          image: data.image,
          published: data.published !== false,
          tags: data.tags || [],
        });

        console.log(`Imported article: ${slug} (${locale})`);
      } catch (error) {
        console.error(`Failed to import article: ${slug} (${locale})`, error);
      }
    }
  }

  console.log('Import completed!');
}

// Run the import
importMdxFiles().catch((error) => {
  console.error('Import failed:', error);
  process.exit(1);
});
