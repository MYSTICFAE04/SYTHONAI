import { NextResponse } from 'next/server';
import { WORKFLOW_TEMPLATES } from '@/lib/workflows';

export async function GET() {
  return NextResponse.json({
    workflows: WORKFLOW_TEMPLATES.map((w) => ({
      id: w.id,
      name: w.name,
      description: w.description,
      category: w.category,
      icon: w.icon,
      color: w.color,
      systemPrompt: w.systemPrompt,
      steps: w.steps,
    })),
  });
}
