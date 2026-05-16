'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sparkles, Copy, Clock, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface LLMResponse {
  modelId: string;
  modelName: string;
  content: string;
  error?: string;
  timestamp: string;
  latency: number;
}

interface SynthesisViewProps {
  query: string;
  responses: LLMResponse[];
  onSynthesize: (strategy: string) => Promise<void>;
  synthesisResult: LLMResponse | null;
  isSynthesizing: boolean;
}

const STRATEGIES = [
  {
    value: 'comprehensive',
    label: 'Comprehensive',
    description:
      'Combines the best insights from all models into a thorough, well-rounded synthesis.',
    emoji: '🧠',
  },
  {
    value: 'concise',
    label: 'Concise',
    description:
      'Delivers a focused, compact summary highlighting only the key takeaways points.',
    emoji: '⚡',
  },
  {
    value: 'analytical',
    label: 'Analytical',
    description:
      'Critically compares and contrasts model outputs, identifying agreements and divergences.',
    emoji: '🔬',
  },
  {
    value: 'creative',
    label: 'Creative',
    description:
      'Generates an innovative synthesis that reimagines and connects ideas in novel ways.',
    emoji: '✨',
  },
] as const;

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export default function SynthesisView({
  query,
  responses,
  onSynthesize,
  synthesisResult,
  isSynthesizing,
}: SynthesisViewProps) {
  const [strategy, setStrategy] = useState<string>('comprehensive');
  const [copied, setCopied] = useState(false);

  const handleSynthesize = useCallback(() => {
    onSynthesize(strategy);
  }, [onSynthesize, strategy]);

  const handleCopy = useCallback(async () => {
    if (!synthesisResult?.content) return;
    try {
      await navigator.clipboard.writeText(synthesisResult.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: no-op
    }
  }, [synthesisResult]);

  const selectedStrategy = STRATEGIES.find((s) => s.value === strategy);
  const hasResponses = responses.length > 0;

  return (
    <div className="space-y-6">
      {/* Strategy Selector + Synthesize Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Synthesis Strategy
          </label>
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger className="w-full sm:w-[260px]">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  {STRATEGIES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className="flex items-center gap-2">
                        <span>{s.emoji}</span>
                        <span>{s.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStrategy && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <span className="text-xs font-bold">?</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[280px]">
                    <p>{selectedStrategy.description}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
          {selectedStrategy && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {selectedStrategy.description}
            </p>
          )}
        </div>

        <Button
          onClick={handleSynthesize}
          disabled={isSynthesizing || !hasResponses}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          size="lg"
        >
          {isSynthesizing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Synthesizing...
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Synthesize
            </>
          )}
        </Button>
      </div>

      {/* Loading State */}
      {isSynthesizing && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-emerald-500/5 p-6">
            {/* Animated shimmer bar */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Sparkles className="size-5 text-emerald-500 animate-pulse" />
                <div className="absolute inset-0 size-5 animate-ping rounded-full bg-emerald-400/20" />
              </div>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                SynthoR&D is synthesizing...
              </span>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-3/5" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Applying <span className="font-medium text-emerald-600 dark:text-emerald-400">{selectedStrategy?.label}</span> strategy to {responses.length} model response{responses.length !== 1 ? 's' : ''}...
            </p>
          </div>
        </div>
      )}

      {/* Synthesis Result */}
      {!isSynthesizing && synthesisResult && (
        <div className="relative rounded-xl p-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-lg shadow-emerald-500/10">
          {/* Inner card to create gradient border effect */}
          <Card className="border-0 bg-background rounded-[10px] overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-amber-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold tracking-tight">
                      SynthoR&D Synthesis
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0"
                      >
                        {selectedStrategy?.label ?? strategy}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {synthesisResult.modelName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>{formatLatency(synthesisResult.latency)}</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          onClick={handleCopy}
                        >
                          <Copy className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {copied ? 'Copied!' : 'Copy synthesis'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {synthesisResult.error ? (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                  <p className="font-medium">Synthesis Error</p>
                  <p className="mt-1 text-destructive/80">
                    {synthesisResult.error}
                  </p>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{synthesisResult.content}</ReactMarkdown>
                </div>
              )}
              {/* Footer metadata */}
              <div className="mt-4 pt-3 border-t flex items-center gap-4 text-[11px] text-muted-foreground">
                <span>
                  Synthesized from{' '}
                  <span className="font-medium">{responses.length}</span>{' '}
                  response{responses.length !== 1 ? 's' : ''}
                </span>
                <span className="size-1 rounded-full bg-border" />
                <span>
                  Strategy:{' '}
                  <span className="font-medium">
                    {selectedStrategy?.label ?? strategy}
                  </span>
                </span>
                <span className="size-1 rounded-full bg-border" />
                <span>
                  {new Date(synthesisResult.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state when no responses */}
      {!isSynthesizing && !synthesisResult && !hasResponses && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <Sparkles className="size-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No model responses yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Submit a query and wait for model responses to enable synthesis.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state when responses exist but no synthesis yet */}
      {!isSynthesizing && !synthesisResult && hasResponses && (
        <Card className="border-dashed border-emerald-500/30 bg-emerald-500/[0.02]">
          <CardContent className="py-8 text-center">
            <Sparkles className="size-8 mx-auto text-emerald-500/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {responses.length} response{responses.length !== 1 ? 's' : ''} ready
              for synthesis
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Choose a strategy and click Synthesize to combine insights from
              multiple models.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
