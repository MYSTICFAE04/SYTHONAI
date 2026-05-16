// LLM helper using z-ai-web-dev-sdk
import ZAI from 'z-ai-web-dev-sdk';
import { getModelById } from './models';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export interface LLMResponse {
  modelId: string;
  modelName: string;
  content: string;
  error?: string;
  timestamp: string;
  latency: number;
}

export async function queryModel(
  modelId: string,
  userQuery: string,
  customSystemPrompt?: string
): Promise<LLMResponse> {
  const startTime = Date.now();
  const model = getModelById(modelId);

  if (!model) {
    return {
      modelId,
      modelName: 'Unknown',
      content: '',
      error: `Model ${modelId} not found`,
      timestamp: new Date().toISOString(),
      latency: 0,
    };
  }

  try {
    const zai = await getZAI();
    const systemPrompt = customSystemPrompt || model.systemPrompt;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userQuery },
      ],
      thinking: { type: 'disabled' },
    });

    const content = completion.choices[0]?.message?.content || '';

    return {
      modelId,
      modelName: model.name,
      content,
      timestamp: new Date().toISOString(),
      latency: Date.now() - startTime,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      modelId,
      modelName: model.name,
      content: '',
      error: message,
      timestamp: new Date().toISOString(),
      latency: Date.now() - startTime,
    };
  }
}

export async function queryMultipleModels(
  modelIds: string[],
  userQuery: string,
  customSystemPrompt?: string
): Promise<LLMResponse[]> {
  const promises = modelIds.map((id) => queryModel(id, userQuery, customSystemPrompt));
  return Promise.all(promises);
}

export async function synthesizeResponses(
  query: string,
  responses: LLMResponse[],
  synthesisStrategy: string = 'comprehensive'
): Promise<LLMResponse> {
  const startTime = Date.now();

  try {
    const zai = await getZAI();

    const validResponses = responses.filter((r) => !r.error && r.content);

    const strategyPrompts: Record<string, string> = {
      comprehensive:
        'Synthesize all the responses into one comprehensive, superior response that combines the best insights, analysis, and perspectives from each model. Resolve any contradictions and highlight areas of consensus.',
      concise:
        'Synthesize the responses into a concise, focused summary that captures only the key insights and most important points from each model.',
      analytical:
        'Analyze the responses critically. Identify areas of agreement and disagreement between models. Provide a nuanced synthesis that acknowledges different perspectives and offers a balanced conclusion.',
      creative:
        'Take the most creative and innovative ideas from each response and synthesize them into a novel, forward-thinking response that pushes beyond what any single model offered.',
    };

    const synthesisSystemPrompt = `You are the SynthoR&D Synthesis Engine, an advanced AI that combines multiple LLM outputs into one superior response. ${strategyPrompts[synthesisStrategy] || strategyPrompts.comprehensive}`;

    const responsesText = validResponses
      .map((r) => `--- ${r.modelName} Response ---\n${r.content}`)
      .join('\n\n');

    const userMessage = `Original Research Query: ${query}\n\nModel Responses to Synthesize:\n\n${responsesText}\n\nProvide a synthesized response that combines the best elements of all models.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: synthesisSystemPrompt },
        { role: 'user', content: userMessage },
      ],
      thinking: { type: 'disabled' },
    });

    const content = completion.choices[0]?.message?.content || '';

    return {
      modelId: 'synthesis-engine',
      modelName: 'SynthoR&D Synthesis Engine',
      content,
      timestamp: new Date().toISOString(),
      latency: Date.now() - startTime,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Synthesis failed';
    return {
      modelId: 'synthesis-engine',
      modelName: 'SynthoR&D Synthesis Engine',
      content: '',
      error: message,
      timestamp: new Date().toISOString(),
      latency: Date.now() - startTime,
    };
  }
}
