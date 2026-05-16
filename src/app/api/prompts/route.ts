import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const prompts = await db.prompt.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ prompts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch prompts';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, category } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'title and content are required' },
        { status: 400 }
      );
    }

    const existing = await db.prompt.findFirst({
      where: { title },
      orderBy: { version: 'desc' },
    });

    const prompt = await db.prompt.create({
      data: {
        title,
        content,
        category: category || 'general',
        version: existing ? existing.version + 1 : 1,
      },
    });

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create prompt';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, title, content, category } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const prompt = await db.prompt.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(category && { category }),
      },
    });

    return NextResponse.json({ prompt });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update prompt';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    await db.prompt.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete prompt';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
