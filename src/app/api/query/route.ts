import { NextRequest, NextResponse } from 'next/server';
import { queryModel } from '@/lib/llm';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { modelId, query, systemPrompt } = await req.json();

    if (!modelId || !query) {
      return NextResponse.json(
        { error: 'modelId and query are required' },
        { status: 400 }
      );
    }

    const result = await queryModel(modelId, query, systemPrompt);

    await db.queryRecord.create({
      data: {
        query,
        models: JSON.stringify([modelId]),
        results: JSON.stringify([result]),
      },
    });

    return NextResponse.json({ result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Query failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
