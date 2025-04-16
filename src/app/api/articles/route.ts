import { NextRequest, NextResponse } from 'next/server';
import { getArticlesByLocale, getArticleBySlug, createArticle, updateArticle, deleteArticle } from '@/lib/actions/articleActions';

// GET /api/articles?locale=en
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'en';
    const slug = searchParams.get('slug');

    if (slug) {
      // Get a specific article
      const article = await getArticleBySlug(slug, locale);
      return NextResponse.json(article);
    } else {
      // Get all articles for the locale
      const articles = await getArticlesByLocale(locale);
      return NextResponse.json(articles);
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST /api/articles
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.slug || !data.locale || !data.title || !data.content) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, locale, title, content' },
        { status: 400 }
      );
    }

    // Create the article
    const article = await createArticle(data);

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

// PUT /api/articles?slug=article-slug&locale=en
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const locale = searchParams.get('locale');

    if (!slug || !locale) {
      return NextResponse.json(
        { error: 'Missing required parameters: slug, locale' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Update the article
    const article = await updateArticle(slug, locale, data);

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles?slug=article-slug&locale=en
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const locale = searchParams.get('locale');

    if (!slug || !locale) {
      return NextResponse.json(
        { error: 'Missing required parameters: slug, locale' },
        { status: 400 }
      );
    }

    // Delete the article
    const article = await deleteArticle(slug, locale);

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
