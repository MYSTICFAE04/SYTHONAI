import { NextRequest, NextResponse } from 'next/server';
import { synthesizeResponses, type LLMResponse } from '@/lib/llm';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { query, responses, strategy } = await req.json();

    if (!query || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'query and responses array are required' },
        { status: 400 }
      );
    }

    const typedResponses: LLMResponse[] = responses;
    const result = await synthesizeResponses(query, typedResponses, strategy);

    const latestRecord = await db.queryRecord.findFirst({
      where: { query },
      orderBy: { createdAt: 'desc' },
    });

    if (latestRecord) {
      await db.queryRecord.update({
        where: { id: latestRecord.id },
        data: { synthesis: JSON.stringify(result) },
      });
    }

    return NextResponse.json({ result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Synthesis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
