import { NextRequest, NextResponse } from 'next/server';
import {
  addAnnotation,
  getAnnotationsForArticle,
  updateAnnotation,
  deleteAnnotation
} from '@/lib/actions/articleActions';

// GET /api/articles/[id]/annotations
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Destructure params to avoid the warning
    const { id } = params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      );
    }

    const annotations = await getAnnotationsForArticle(articleId);
    return NextResponse.json(annotations);
  } catch (error) {
    console.error('Error fetching annotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annotations' },
      { status: 500 }
    );
  }
}

// POST /api/articles/[id]/annotations
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Destructure params to avoid the warning
    const { id } = params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.userId || !data.textFragment || !data.position || !data.note) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, textFragment, position, note' },
        { status: 400 }
      );
    }

    // Add the annotation
    const annotation = await addAnnotation({
      articleId,
      userId: data.userId,
      textFragment: data.textFragment,
      position: data.position,
      note: data.note,
    });

    return NextResponse.json(annotation, { status: 201 });
  } catch (error) {
    console.error('Error adding annotation:', error);
    return NextResponse.json(
      { error: 'Failed to add annotation' },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[id]/annotations?annotationId=123
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // We don't need to use params.id here as we're using the annotationId from the query params
  try {
    const searchParams = request.nextUrl.searchParams;
    const annotationId = parseInt(searchParams.get('annotationId') || '');

    if (isNaN(annotationId)) {
      return NextResponse.json(
        { error: 'Invalid annotation ID' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.note) {
      return NextResponse.json(
        { error: 'Missing required field: note' },
        { status: 400 }
      );
    }

    // Update the annotation
    const annotation = await updateAnnotation(annotationId, data.note);

    return NextResponse.json(annotation);
  } catch (error) {
    console.error('Error updating annotation:', error);
    return NextResponse.json(
      { error: 'Failed to update annotation' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id]/annotations?annotationId=123
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // We don't need to use params.id here as we're using the annotationId from the query params
  try {
    const searchParams = request.nextUrl.searchParams;
    const annotationId = parseInt(searchParams.get('annotationId') || '');

    if (isNaN(annotationId)) {
      return NextResponse.json(
        { error: 'Invalid annotation ID' },
        { status: 400 }
      );
    }

    // Delete the annotation
    const annotation = await deleteAnnotation(annotationId);

    return NextResponse.json(annotation);
  } catch (error) {
    console.error('Error deleting annotation:', error);
    return NextResponse.json(
      { error: 'Failed to delete annotation' },
      { status: 500 }
    );
  }
}
