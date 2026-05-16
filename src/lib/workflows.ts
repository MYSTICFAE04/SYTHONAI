// Workflow templates for SynthoR&D

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  promptTemplate: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  systemPrompt: string;
  steps: WorkflowStep[];
}

export const WORKFLOW_TEMPLATES: Workflow[] = [
  {
    id: 'literature-review',
    name: 'Literature Review',
    description: 'Systematically review and synthesize academic literature on a topic',
    category: 'Research',
    icon: 'BookOpen',
    color: '#10a37f',
    systemPrompt:
      'You are an academic research assistant specializing in literature reviews. Provide well-structured, citation-aware analysis of research topics. Follow academic conventions and highlight key findings, methodologies, and gaps in the literature.',
    steps: [
      {
        id: 'scope',
        title: 'Define Scope',
        description: 'Define the research scope and key questions',
        promptTemplate:
          'Define the scope for a literature review on: {{topic}}. Include key research questions, inclusion/exclusion criteria, and relevant search terms.',
      },
      {
        id: 'key-findings',
        title: 'Identify Key Findings',
        description: 'Summarize major findings from existing research',
        promptTemplate:
          'Based on the defined scope for {{topic}}, what are the key findings from existing research? Organize by themes and methodologies.',
      },
      {
        id: 'gaps',
        title: 'Identify Gaps',
        description: 'Identify research gaps and opportunities',
        promptTemplate:
          'For the literature review on {{topic}}, identify the major research gaps, methodological limitations, and opportunities for future research.',
      },
      {
        id: 'synthesis',
        title: 'Synthesize Review',
        description: 'Create a comprehensive synthesis of the literature',
        promptTemplate:
          'Synthesize a complete literature review on {{topic}} incorporating the scope, key findings, and identified gaps. Provide a structured academic summary.',
      },
    ],
  },
  {
    id: 'brainstorming',
    name: 'Brainstorming Session',
    description: 'Generate creative ideas and explore innovative solutions',
    category: 'Ideation',
    icon: 'Lightbulb',
    color: '#f97316',
    systemPrompt:
      'You are a creative ideation partner. Generate bold, innovative ideas while also considering practical feasibility. Use divergent thinking techniques like SCAMPER, mind mapping, and lateral thinking. Build on concepts and explore unexpected connections.',
    steps: [
      {
        id: 'problem',
        title: 'Define Problem',
        description: 'Clearly define the problem or opportunity space',
        promptTemplate:
          'Clearly define the problem or opportunity space for: {{topic}}. What are the core challenges? Who is affected? What are the constraints?',
      },
      {
        id: 'generate',
        title: 'Generate Ideas',
        description: 'Rapid ideation with diverse perspectives',
        promptTemplate:
          'Generate 10+ creative ideas for addressing: {{topic}}. Use diverse thinking approaches - some practical, some radical, some hybrid. Think beyond obvious solutions.',
      },
      {
        id: 'evaluate',
        title: 'Evaluate Ideas',
        description: 'Assess feasibility and impact of top ideas',
        promptTemplate:
          'Evaluate the generated ideas for {{topic}} on feasibility (1-5), impact (1-5), and novelty (1-5). Rank them and provide brief rationale for top selections.',
      },
      {
        id: 'refine',
        title: 'Refine Top Ideas',
        description: 'Develop the best ideas into actionable concepts',
        promptTemplate:
          'Take the top 3 ideas from the brainstorming session on {{topic}} and develop them into actionable concepts with next steps, required resources, and potential risks.',
      },
    ],
  },
  {
    id: 'report-drafting',
    name: 'Report Drafting',
    description: 'Structure and draft professional research reports',
    category: 'Writing',
    icon: 'FileText',
    color: '#8b5cf6',
    systemPrompt:
      'You are a professional research report writer. Create well-structured, clear, and comprehensive reports. Use professional language, proper formatting, and evidence-based arguments. Include executive summaries, methodologies, findings, and recommendations.',
    steps: [
      {
        id: 'outline',
        title: 'Create Outline',
        description: 'Develop a comprehensive report structure',
        promptTemplate:
          'Create a detailed outline for a research report on: {{topic}}. Include sections for executive summary, introduction, methodology, findings, discussion, and recommendations.',
      },
      {
        id: 'exec-summary',
        title: 'Executive Summary',
        description: 'Draft the executive summary',
        promptTemplate:
          'Draft an executive summary for a research report on {{topic}}. Capture the key findings, implications, and recommendations in a concise format.',
      },
      {
        id: 'findings',
        title: 'Key Findings',
        description: 'Document the main findings and analysis',
        promptTemplate:
          'Document the key findings and analysis for the research report on {{topic}}. Present evidence clearly, use data where possible, and connect findings to the research questions.',
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        description: 'Formulate actionable recommendations',
        promptTemplate:
          'Based on the findings for {{topic}}, formulate clear, actionable recommendations. Prioritize them by impact and feasibility, and provide implementation guidance.',
      },
    ],
  },
  {
    id: 'competitive-analysis',
    name: 'Competitive Analysis',
    description: 'Analyze competitors and market landscape',
    category: 'Strategy',
    icon: 'BarChart3',
    color: '#ec4899',
    systemPrompt:
      'You are a strategic business analyst specializing in competitive intelligence. Provide thorough analysis of market landscapes, competitor strengths/weaknesses, and strategic positioning. Use frameworks like SWOT, Porter\'s Five Forces, and competitive matrices.',
    steps: [
      {
        id: 'landscape',
        title: 'Market Landscape',
        description: 'Map the competitive landscape',
        promptTemplate:
          'Map the competitive landscape for: {{topic}}. Identify key players, market segments, and industry dynamics.',
      },
      {
        id: 'swot',
        title: 'SWOT Analysis',
        description: 'Conduct SWOT analysis for key competitors',
        promptTemplate:
          'Conduct a detailed SWOT analysis for the key competitors in: {{topic}}. Focus on strengths, weaknesses, opportunities, and threats.',
      },
      {
        id: 'positioning',
        title: 'Strategic Positioning',
        description: 'Identify strategic positioning opportunities',
        promptTemplate:
          'Based on the competitive analysis of {{topic}}, identify strategic positioning opportunities and white space in the market.',
      },
    ],
  },
  {
    id: 'experiment-design',
    name: 'Experiment Design',
    description: 'Design rigorous experiments and research methodologies',
    category: 'Research',
    icon: 'FlaskConical',
    color: '#06b6d4',
    systemPrompt:
      'You are a research methodology expert. Design rigorous, well-controlled experiments with clear hypotheses, variables, and statistical approaches. Consider threats to validity and practical constraints.',
    steps: [
      {
        id: 'hypothesis',
        title: 'Form Hypothesis',
        description: 'Develop testable hypotheses',
        promptTemplate:
          'Develop clear, testable hypotheses for research on: {{topic}}. Include null and alternative hypotheses.',
      },
      {
        id: 'methodology',
        title: 'Design Methodology',
        description: 'Design the experimental methodology',
        promptTemplate:
          'Design the experimental methodology for testing hypotheses about {{topic}}. Include study design, sample size considerations, variables, and controls.',
      },
      {
        id: 'analysis-plan',
        title: 'Analysis Plan',
        description: 'Plan the data analysis approach',
        promptTemplate:
          'Create a data analysis plan for the experiment on {{topic}}. Specify statistical tests, significance levels, and how results will be interpreted.',
      },
    ],
  },
];

export function getWorkflowById(id: string): Workflow | undefined {
  return WORKFLOW_TEMPLATES.find((w) => w.id === id);
}
