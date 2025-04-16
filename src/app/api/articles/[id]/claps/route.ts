import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { claps } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET all claps for an article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = parseInt(params.id, 10);
    
    // Validate article ID
    if (isNaN(articleId)) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
    }

    // Get all claps for the article
    const result = await db.query.claps.findMany({
      where: and(
        eq(claps.articleId, articleId)
      ),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting claps:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST a new clap or increment an existing one
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = parseInt(params.id, 10);
    
    // Validate article ID
    if (isNaN(articleId)) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
    }

    // Get the request body
    const body = await request.json();
    const { textFragment, position } = body;
    
    // Validate required fields
    if (!textFragment || !position) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if this text fragment already has claps
    const existingClap = await db.query.claps.findFirst({
      where: and(
        eq(claps.articleId, articleId),
        eq(claps.textFragment, textFragment)
      ),
    });

    if (existingClap) {
      // Increment the clap count
      const [updatedClap] = await db
        .update(claps)
        .set({
          count: existingClap.count + 1,
          updatedAt: new Date(),
        })
        .where(eq(claps.id, existingClap.id))
        .returning();

      return NextResponse.json(updatedClap);
    } else {
      // Create a new clap
      const [newClap] = await db
        .insert(claps)
        .values({
          articleId,
          textFragment,
          position,
          count: 1,
        })
        .returning();

      return NextResponse.json(newClap);
    }
  } catch (error) {
    console.error('Error adding clap:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
