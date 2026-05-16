import { NextResponse } from 'next/server';
import { AVAILABLE_MODELS } from '@/lib/models';

export async function GET() {
  return NextResponse.json({
    models: AVAILABLE_MODELS.map((m) => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      description: m.description,
      strengths: m.strengths,
      color: m.color,
      icon: m.icon,
    })),
  });
}
