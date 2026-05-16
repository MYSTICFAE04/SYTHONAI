'use client';

import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  Send,
  BookOpen,
  Lightbulb,
  FileText,
  FlaskConical,
  RotateCcw,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { ModelSelector } from '@/components/syntho/model-selector';
import ComparisonView, { type LLMResponse } from '@/components/syntho/comparison-view';
import SynthesisView from '@/components/syntho/synthesis-view';
import { PromptLibrary, type Prompt } from '@/components/syntho/prompt-library';
import WorkflowTemplates from '@/components/syntho/workflow-templates';
import type { Workflow } from '@/lib/workflows';

export default function Home() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [selectedModels, setSelectedModels] = useState<string[]>([
    'gpt-4o',
    'claude-3.5-sonnet',
  ]);
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<LLMResponse[]>([]);
  const [synthesisResult, setSynthesisResult] = useState<LLMResponse | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeTab, setActiveTab] = useState('research');

  // ── Run parallel query ──────────────────────────────────────────────────────
  const handleRunQuery = useCallback(async () => {
    if (!query.trim()) {
      toast.error('Please enter a research query');
      return;
    }
    if (selectedModels.length < 2) {
      toast.error('Select at least 2 models to compare');
      return;
    }

    setIsQuerying(true);
    setResponses([]);
    setSynthesisResult(null);

    try {
      const res = await fetch('/api/query/parallel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelIds: selectedModels,
          query: query.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Query failed');
      }

      const data = await res.json();
      setResponses(data.results ?? []);
      toast.success(`Received ${data.results?.length ?? 0} model responses`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Query failed';
      toast.error(message);
    } finally {
      setIsQuerying(false);
    }
  }, [query, selectedModels]);

  // ── Synthesize responses ────────────────────────────────────────────────────
  const handleSynthesize = useCallback(
    async (strategy: string) => {
      if (responses.length === 0) {
        toast.error('No responses to synthesize');
        return;
      }

      setIsSynthesizing(true);
      try {
        const res = await fetch('/api/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, responses, strategy }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Synthesis failed');
        }

        const data = await res.json();
        setSynthesisResult(data.result);
        toast.success('Synthesis complete!');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Synthesis failed';
        toast.error(message);
      } finally {
        setIsSynthesizing(false);
      }
    },
    [query, responses]
  );

  // ── Load prompt from library ────────────────────────────────────────────────
  const handleLoadPrompt = useCallback((prompt: Prompt) => {
    setQuery(prompt.content);
    toast.success(`Loaded: ${prompt.title}`);
  }, []);

  // ── Handle workflow start ───────────────────────────────────────────────────
  const handleStartWorkflow = useCallback(
    (_workflow: Workflow, topic: string, models: string[]) => {
      setQuery(topic);
      setSelectedModels(models.length >= 2 ? models : selectedModels);
      setActiveTab('research');
      toast.success(`Workflow configured with topic: ${topic}`);
    },
    [selectedModels]
  );

  // ── Reset everything ────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setQuery('');
    setResponses([]);
    setSynthesisResult(null);
    toast.success('Workspace reset');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">SynthoR&amp;D</h1>
                <p className="hidden sm:block text-[11px] text-muted-foreground leading-tight">
                  AI-Powered Multi-LLM Collaborative Research
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {responses.length > 0 && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Zap className="h-3 w-3" />
                  {responses.length} responses
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger
              value="research"
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg py-2.5"
            >
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">Research Hub</span>
              <span className="sm:hidden">Research</span>
            </TabsTrigger>
            <TabsTrigger
              value="compare"
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg py-2.5"
              disabled={responses.length === 0 && !isQuerying}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Compare</span>
              <span className="sm:hidden">Compare</span>
            </TabsTrigger>
            <TabsTrigger
              value="prompts"
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg py-2.5"
            >
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Prompts</span>
              <span className="sm:hidden">Prompts</span>
            </TabsTrigger>
            <TabsTrigger
              value="workflows"
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg py-2.5"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Workflows</span>
              <span className="sm:hidden">Flows</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Research Hub Tab ──────────────────────────────────────────── */}
          <TabsContent value="research" className="space-y-6">
            {/* Model Selector */}
            <ModelSelector
              selectedModels={selectedModels}
              onSelectionChange={setSelectedModels}
              minSelected={2}
              maxSelected={5}
            />

            <Separator />

            {/* Query Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight">Research Query</h3>
                <Badge variant="outline" className="text-xs">
                  {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
                </Badge>
              </div>
              <div className="relative">
                <Textarea
                  placeholder="Enter your research question, hypothesis, or topic to explore across multiple LLMs..."
                  className="min-h-[120px] resize-y text-sm pr-4"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleRunQuery();
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Press <kbd className="rounded border px-1 py-0.5 text-[10px] font-mono">Ctrl</kbd>
                  {' + '}
                  <kbd className="rounded border px-1 py-0.5 text-[10px] font-mono">Enter</kbd>{' '}
                  to run
                </p>
                <Button
                  onClick={handleRunQuery}
                  disabled={isQuerying || !query.trim() || selectedModels.length < 2}
                  className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isQuerying ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Querying {selectedModels.length} Models...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Run Parallel Query
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Inline Comparison (compact) */}
            {responses.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold tracking-tight">Model Responses</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('compare')}
                      className="gap-1.5"
                    >
                      Full Comparison
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <ComparisonView responses={responses} isLoading={isQuerying} />
                </div>
              </>
            )}

            {/* Synthesis Section */}
            {responses.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold tracking-tight">Intelligent Synthesis</h3>
                  <SynthesisView
                    query={query}
                    responses={responses}
                    onSynthesize={handleSynthesize}
                    synthesisResult={synthesisResult}
                    isSynthesizing={isSynthesizing}
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* ── Compare Tab ───────────────────────────────────────────────── */}
          <TabsContent value="compare" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Side-by-Side Comparison</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Compare outputs from multiple LLMs to identify strengths, differences, and consensus.
                </p>
              </div>
              {responses.length > 0 && !synthesisResult && (
                <Button
                  onClick={() => setActiveTab('research')}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  Back to Research
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <ComparisonView responses={responses} isLoading={isQuerying} />

            {/* Synthesis below comparison */}
            {responses.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold tracking-tight">Synthesis</h3>
                  <SynthesisView
                    query={query}
                    responses={responses}
                    onSynthesize={handleSynthesize}
                    synthesisResult={synthesisResult}
                    isSynthesizing={isSynthesizing}
                  />
                </div>
              </>
            )}

            {responses.length === 0 && !isQuerying && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                <BookOpen className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">No responses to compare</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Run a parallel query first to see model outputs side by side.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-1.5"
                  onClick={() => setActiveTab('research')}
                >
                  Go to Research Hub
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ── Prompt Library Tab ────────────────────────────────────────── */}
          <TabsContent value="prompts" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Prompt Library</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Save, version, and reuse research prompts across sessions.
              </p>
            </div>
            <PromptLibrary onLoadPrompt={handleLoadPrompt} />
          </TabsContent>

          {/* ── Workflows Tab ─────────────────────────────────────────────── */}
          <TabsContent value="workflows" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Research Workflows</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Step-by-step guided workflows for common research tasks.
              </p>
            </div>
            <WorkflowTemplates
              onStartWorkflow={handleStartWorkflow}
              selectedModels={selectedModels}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              <span>SynthoR&amp;D — AI-Powered Multi-LLM Research Platform</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Powered by z-ai-web-dev-sdk</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Next.js + TypeScript</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
