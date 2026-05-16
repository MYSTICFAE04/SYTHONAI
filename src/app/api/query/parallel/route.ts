import { NextRequest, NextResponse } from 'next/server';
import { queryMultipleModels } from '@/lib/llm';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { modelIds, query, systemPrompt } = await req.json();

    if (!modelIds || !Array.isArray(modelIds) || modelIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 modelIds are required for parallel query' },
        { status: 400 }
      );
    }

    if (!query) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 }
      );
    }

    const results = await queryMultipleModels(modelIds, query, systemPrompt);

    await db.queryRecord.create({
      data: {
        query,
        models: JSON.stringify(modelIds),
        results: JSON.stringify(results),
      },
    });

    return NextResponse.json({ results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Parallel query failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
