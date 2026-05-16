'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  BookOpen,
  Lightbulb,
  FileText,
  BarChart3,
  FlaskConical,
  Check,
  ChevronRight,
  ChevronLeft,
  Play,
  ArrowRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  promptTemplate: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  systemPrompt: string;
  steps: WorkflowStep[];
}

interface StepResult {
  modelId: string;
  modelName: string;
  content: string;
  error?: string;
}

interface StepState {
  status: 'pending' | 'running' | 'completed' | 'error';
  results: StepResult[];
}

interface WorkflowTemplatesProps {
  onStartWorkflow: (workflow: Workflow, topic: string, selectedModels: string[]) => void;
  selectedModels: string[];
}

// ---------------------------------------------------------------------------
// Icon resolver
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  BookOpen,
  Lightbulb,
  FileText,
  BarChart3,
  FlaskConical,
};

function WorkflowIcon({
  name,
  ...props
}: { name: string } & React.SVGProps<SVGSVGElement>) {
  const Comp = ICON_MAP[name] ?? BookOpen;
  return <Comp {...props} />;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** The initial grid of workflow template cards. */
function TemplateGrid({
  workflows,
  onSelect,
}: {
  workflows: Workflow[];
  onSelect: (w: Workflow) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {workflows.map((w) => (
        <Card
          key={w.id}
          className="group relative overflow-hidden border border-border/60 transition-all duration-300 hover:shadow-lg hover:border-border cursor-pointer"
          onClick={() => onSelect(w)}
        >
          {/* Color accent bar */}
          <div
            className="absolute top-0 left-0 h-1 w-full"
            style={{ backgroundColor: w.color }}
          />

          <CardHeader className="pb-3 pt-5">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${w.color}18` }}
              >
                <WorkflowIcon
                  name={w.icon}
                  className="h-5 w-5"
                  style={{ color: w.color }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base leading-snug">{w.name}</CardTitle>
                <Badge
                  variant="secondary"
                  className="mt-1.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: `${w.color}14`,
                    color: w.color,
                    borderColor: `${w.color}30`,
                  }}
                >
                  {w.category}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 pb-5 flex flex-col gap-4">
            <CardDescription className="text-sm leading-relaxed">
              {w.description}
            </CardDescription>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {w.steps.length} step{w.steps.length !== 1 ? 's' : ''}
              </span>
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs font-medium"
                style={{ backgroundColor: w.color }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(w);
                }}
              >
                <Play className="h-3 w-3" />
                Start Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Vertical stepper with connected lines. */
function WorkflowStepper({
  workflow,
  currentStep,
  stepStates,
  onStepClick,
}: {
  workflow: Workflow;
  currentStep: number;
  stepStates: StepState[];
  onStepClick: (index: number) => void;
}) {
  return (
    <div className="flex flex-col">
      {workflow.steps.map((step, i) => {
        const state = stepStates[i];
        const isCompleted = state?.status === 'completed';
        const isCurrent = i === currentStep;
        const isFuture = i > currentStep && !isCompleted;
        const isLast = i === workflow.steps.length - 1;

        return (
          <div key={step.id} className="flex">
            {/* Left column: indicator + connector */}
            <div className="flex flex-col items-center mr-4">
              {/* Circle indicator */}
              <button
                type="button"
                onClick={() => {
                  if (isCompleted || isCurrent) onStepClick(i);
                }}
                className={`
                  relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                  border-2 text-sm font-semibold transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  ${isCompleted ? 'border-transparent text-white' : ''}
                  ${isCurrent && !isCompleted ? 'border-2 text-white' : ''}
                  ${isFuture ? 'border-muted-foreground/30 bg-muted text-muted-foreground/50' : ''}
                `}
                style={
                  isCompleted
                    ? { backgroundColor: workflow.color }
                    : isCurrent
                      ? { borderColor: workflow.color, color: workflow.color }
                      : undefined
                }
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[32px] transition-colors duration-300 ${
                    isCompleted ? 'opacity-100' : 'bg-muted-foreground/20'
                  }`}
                  style={isCompleted ? { backgroundColor: workflow.color } : undefined}
                />
              )}
            </div>

            {/* Right column: step info */}
            <div
              className={`pb-6 pt-0.5 flex-1 min-w-0 ${isLast ? 'pb-0' : ''}`}
            >
              <h4
                className={`text-sm font-semibold leading-tight ${
                  isFuture ? 'text-muted-foreground/50' : 'text-foreground'
                }`}
              >
                {step.title}
              </h4>
              <p
                className={`mt-0.5 text-xs leading-relaxed ${
                  isFuture ? 'text-muted-foreground/40' : 'text-muted-foreground'
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** The step execution panel: topic, prompt, run, results. */
function StepPanel({
  workflow,
  stepIndex,
  stepStates,
  topic,
  onTopicChange,
  onRunStep,
}: {
  workflow: Workflow;
  stepIndex: number;
  stepStates: StepState[];
  topic: string;
  onTopicChange: (v: string) => void;
  onRunStep: () => void;
}) {
  const step = workflow.steps[stepIndex];
  const state = stepStates[stepIndex];
  const isRunning = state?.status === 'running';

  const resolvedPrompt = step.promptTemplate.replace(/\{\{topic\}\}/g, topic || '{{topic}}');

  return (
    <div className="flex flex-col gap-5">
      {/* Topic input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="wf-topic">
          Research Topic
        </label>
        <Input
          id="wf-topic"
          placeholder="e.g. Large language models in healthcare"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Resolved prompt preview */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Prompt Preview</span>
        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono">
            {resolvedPrompt}
          </p>
        </div>
      </div>

      {/* Run button */}
      <Button
        className="w-full gap-2 font-medium"
        style={{ backgroundColor: workflow.color }}
        disabled={isRunning || !topic.trim()}
        onClick={onRunStep}
      >
        {isRunning ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Running…
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Run Step — {step.title}
          </>
        )}
      </Button>

      {/* Results */}
      {state && state.results.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-foreground">Results</span>
          <div className="max-h-[420px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {state.results.map((r) => (
              <Card key={r.modelId} className="border border-border/50">
                <CardHeader className="py-3 px-4 pb-2">
                  <CardTitle className="text-sm font-semibold">{r.modelName}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-0">
                  {r.error ? (
                    <p className="text-xs text-destructive">{r.error}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {r.content}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function WorkflowTemplates({
  onStartWorkflow,
  selectedModels,
}: WorkflowTemplatesProps) {
  // Data
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Selection / navigation
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [topic, setTopic] = useState('');

  // Per-step execution state
  const [stepStates, setStepStates] = useState<StepState[]>([]);

  // ----- Fetch workflows --------------------------------------------------

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/workflows');
        if (!res.ok) throw new Error('Failed to fetch workflows');
        const data = await res.json();
        if (!cancelled) {
          setWorkflows(data.workflows ?? []);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ----- Handlers ---------------------------------------------------------

  const handleSelectWorkflow = useCallback((w: Workflow) => {
    setSelectedWorkflow(w);
    setCurrentStep(0);
    setTopic('');
    setStepStates(w.steps.map(() => ({ status: 'pending', results: [] })));
  }, []);

  const handleBack = useCallback(() => {
    setSelectedWorkflow(null);
    setCurrentStep(0);
    setTopic('');
    setStepStates([]);
  }, []);

  const handleRunStep = useCallback(async () => {
    if (!selectedWorkflow || !topic.trim() || selectedModels.length === 0) return;

    const step = selectedWorkflow.steps[currentStep];
    const prompt = step.promptTemplate.replace(/\{\{topic\}\}/g, topic);

    // Mark running
    setStepStates((prev) =>
      prev.map((s, i) =>
        i === currentStep ? { ...s, status: 'running' as const } : s
      )
    );

    try {
      const res = await fetch('/api/query/parallel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelIds: selectedModels,
          query: prompt,
          systemPrompt: selectedWorkflow.systemPrompt,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? 'Query failed');
      }

      const data = await res.json();

      const results: StepResult[] = (data.results ?? []).map(
        (r: { modelId?: string; model?: string; content?: string; error?: string }) => ({
          modelId: r.modelId ?? 'unknown',
          modelName: r.model ?? r.modelId ?? 'Unknown',
          content: r.content ?? '',
          error: r.error,
        })
      );

      setStepStates((prev) =>
        prev.map((s, i) =>
          i === currentStep ? { status: 'completed' as const, results } : s
        )
      );
    } catch (err: unknown) {
      setStepStates((prev) =>
        prev.map((s, i) =>
          i === currentStep
            ? {
                ...s,
                status: 'error' as const,
                results: [
                  {
                    modelId: 'error',
                    modelName: 'Error',
                    content: '',
                    error: err instanceof Error ? err.message : 'Unknown error',
                  },
                ],
              }
            : s
        )
      );
    }
  }, [selectedWorkflow, currentStep, topic, selectedModels]);

  const handleNext = useCallback(() => {
    if (!selectedWorkflow) return;
    if (currentStep < selectedWorkflow.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [selectedWorkflow, currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleStartWorkflow = useCallback(() => {
    if (selectedWorkflow && topic.trim()) {
      onStartWorkflow(selectedWorkflow, topic, selectedModels);
    }
  }, [selectedWorkflow, topic, selectedModels, onStartWorkflow]);

  // ----- Render -----------------------------------------------------------

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-5 w-16 rounded-full bg-muted" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-5 space-y-3">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-4/5 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-destructive font-medium">Failed to load workflows</p>
          <p className="text-xs text-muted-foreground mt-1">{fetchError}</p>
        </CardContent>
      </Card>
    );
  }

  // No workflows
  if (workflows.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No workflow templates available.</p>
        </CardContent>
      </Card>
    );
  }

  // --- Template selection view ---
  if (!selectedWorkflow) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Workflow Templates</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a research workflow to guide your investigation step-by-step.
          </p>
        </div>
        <TemplateGrid workflows={workflows} onSelect={handleSelectWorkflow} />
      </div>
    );
  }

  // --- Workflow stepper view ---
  const isLastStep = currentStep === selectedWorkflow.steps.length - 1;
  const currentStepState = stepStates[currentStep];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground"
          onClick={handleBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: `${selectedWorkflow.color}18` }}
          >
            <WorkflowIcon
              name={selectedWorkflow.icon}
              className="h-4 w-4"
              style={{ color: selectedWorkflow.color }}
            />
          </div>
          <h2 className="text-lg font-bold tracking-tight truncate">
            {selectedWorkflow.name}
          </h2>
        </div>

        <Badge variant="secondary" className="shrink-0 text-xs">
          Step {currentStep + 1} / {selectedWorkflow.steps.length}
        </Badge>
      </div>

      {/* Body: stepper + panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: stepper timeline */}
        <div className="lg:col-span-4">
          <Card className="border border-border/50">
            <CardContent className="p-5">
              <WorkflowStepper
                workflow={selectedWorkflow}
                currentStep={currentStep}
                stepStates={stepStates}
                onStepClick={setCurrentStep}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: step execution panel */}
        <div className="lg:col-span-8">
          <Card className="border border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: selectedWorkflow.color }}
                >
                  {currentStep + 1}
                </span>
                <div>
                  <CardTitle className="text-base">
                    {selectedWorkflow.steps[currentStep].title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {selectedWorkflow.steps[currentStep].description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <StepPanel
                workflow={selectedWorkflow}
                stepIndex={currentStep}
                stepStates={stepStates}
                topic={topic}
                onTopicChange={setTopic}
                onRunStep={handleRunStep}
              />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={currentStep === 0}
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {isLastStep ? (
              <Button
                size="sm"
                className="gap-1.5 font-medium"
                style={{ backgroundColor: selectedWorkflow.color }}
                disabled={
                  !topic.trim() ||
                  stepStates.some((s) => s.status === 'pending' || s.status === 'running')
                }
                onClick={handleStartWorkflow}
              >
                Complete Workflow
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                className="gap-1.5 font-medium"
                style={{ backgroundColor: selectedWorkflow.color }}
                disabled={currentStep >= selectedWorkflow.steps.length - 1}
                onClick={handleNext}
              >
                Next Step
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
