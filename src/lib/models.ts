// Model definitions for SynthoR&D Multi-LLM platform

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  strengths: string[];
  color: string;
  icon: string;
  systemPrompt: string;
}

export const AVAILABLE_MODELS: LLMModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'General-purpose model with strong reasoning and balanced outputs',
    strengths: ['Reasoning', 'Balanced', 'Versatile'],
    color: '#10a37f',
    icon: '🧠',
    systemPrompt: 'You are GPT-4o, a highly capable general-purpose AI assistant. Provide well-structured, comprehensive, and balanced responses. Use clear headings and organized sections. Aim for thoroughness while maintaining clarity.',
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Analytical model excelling at nuanced reasoning and careful analysis',
    strengths: ['Analysis', 'Nuance', 'Safety'],
    color: '#d4a574',
    icon: '🔍',
    systemPrompt: 'You are Claude 3.5 Sonnet, an AI assistant known for careful analysis and nuanced reasoning. Provide thoughtful, well-considered responses that acknowledge complexity and multiple perspectives. Be thorough in your analysis and careful with claims. Highlight caveats and limitations where relevant.',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Creative model with broad knowledge and multi-modal thinking',
    strengths: ['Creativity', 'Breadth', 'Innovation'],
    color: '#4285f4',
    icon: '✨',
    systemPrompt: 'You are Gemini Pro, a creative and innovative AI assistant. Think broadly and make unexpected connections. Provide creative solutions and novel perspectives. Use analogies and metaphors where helpful. Push beyond conventional thinking while remaining grounded.',
  },
  {
    id: 'llama-3-70b',
    name: 'Llama-3 70B',
    provider: 'Meta',
    description: 'Technical model with concise, code-oriented outputs',
    strengths: ['Technical', 'Concise', 'Code'],
    color: '#0668e1',
    icon: '⚡',
    systemPrompt: 'You are Llama-3 70B, a technically-focused AI assistant. Provide concise, technically precise responses. Prioritize accuracy and efficiency. Use structured formats with bullet points and numbered lists. Include technical details and specifications where relevant.',
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    description: 'Structured model with systematic, methodical approach',
    strengths: ['Structured', 'Methodical', 'Efficient'],
    color: '#f97316',
    icon: '📐',
    systemPrompt: 'You are Mistral Large, a systematic and methodical AI assistant. Provide highly structured responses with clear logical flow. Use frameworks and methodologies where applicable. Break complex problems into manageable steps. Prioritize efficiency and actionable insights.',
  },
];

export function getModelById(id: string): LLMModel | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}

export function getModelsByIds(ids: string[]): LLMModel[] {
  return ids.map(getModelById).filter((m): m is LLMModel => m !== undefined);
}
