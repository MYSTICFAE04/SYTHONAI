'use client';

import { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Clock, AlertCircle, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LLMResponse {
  modelId: string;
  modelName: string;
  content: string;
  error?: string;
  timestamp: string;
  latency: number;
}

interface ComparisonViewProps {
  responses: LLMResponse[];
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Model accent colours – avoids indigo / blue primaries
// ---------------------------------------------------------------------------

const MODEL_ACCENTS: Record<string, { border: string; badge: string; dot: string }> = {
  'gpt-4o':        { border: 'border-t-teal-500',    badge: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',   dot: 'bg-teal-500' },
  'gpt-4o-mini':   { border: 'border-t-teal-400',    badge: 'bg-teal-400/10 text-teal-600 dark:text-teal-300',   dot: 'bg-teal-400' },
  'claude-3.5':    { border: 'border-t-amber-500',   badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  'claude-3':      { border: 'border-t-amber-400',   badge: 'bg-amber-400/10 text-amber-600 dark:text-amber-300', dot: 'bg-amber-400' },
  'gemini-pro':    { border: 'border-t-rose-500',    badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',    dot: 'bg-rose-500' },
  'gemini-flash':  { border: 'border-t-rose-400',    badge: 'bg-rose-400/10 text-rose-600 dark:text-rose-300',    dot: 'bg-rose-400' },
  'llama-3.1':     { border: 'border-t-emerald-500', badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  'mistral-large':  { border: 'border-t-violet-500',  badge: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',  dot: 'bg-violet-500' },
  'deepseek-v3':   { border: 'border-t-cyan-500',    badge: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',    dot: 'bg-cyan-500' },
  'qwen-2.5':      { border: 'border-t-orange-500',  badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
};

const DEFAULT_ACCENT = { border: 'border-t-slate-500', badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-400', dot: 'bg-slate-500' };

function getAccent(modelId: string) {
  // Try exact match first, then partial match
  if (MODEL_ACCENTS[modelId]) return MODEL_ACCENTS[modelId];
  const key = Object.keys(MODEL_ACCENTS).find((k) => modelId.toLowerCase().includes(k));
  return key ? MODEL_ACCENTS[key] : DEFAULT_ACCENT;
}

// ---------------------------------------------------------------------------
// Latency badge colour helper
// ---------------------------------------------------------------------------

function latencyVariant(latency: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (latency < 1000) return 'secondary';
  if (latency < 3000) return 'outline';
  return 'destructive';
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy response'}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton card
// ---------------------------------------------------------------------------

function ComparisonCardSkeleton() {
  return (
    <Card className="border-t-2 border-t-muted overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Single response card
// ---------------------------------------------------------------------------

function ComparisonCard({ response }: { response: LLMResponse }) {
  const accent = getAccent(response.modelId);
  const hasError = !!response.error;

  return (
    <Card
      className={`border-t-2 ${accent.border} flex flex-col overflow-hidden transition-shadow hover:shadow-md`}
    >
      {/* ── Header ── */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${accent.dot}`}
              aria-hidden="true"
            />
            <CardTitle className="truncate text-sm">{response.modelName}</CardTitle>
          </div>
          <Badge
            variant={latencyVariant(response.latency)}
            className="shrink-0 gap-1 text-[11px] font-medium"
          >
            <Clock className="h-3 w-3" />
            {formatLatency(response.latency)}
          </Badge>
        </div>
      </CardHeader>

      {/* ── Content ── */}
      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        {hasError ? (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive leading-relaxed">
              {response.error}
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-96 w-full">
            <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none pr-3 prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:my-2 prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown>{response.content}</ReactMarkdown>
            </div>
          </ScrollArea>
        )}

        {/* ── Footer actions ── */}
        <div className="mt-auto flex items-center justify-between border-t pt-3">
          <span className="text-[11px] text-muted-foreground">
            {new Date(response.timestamp).toLocaleTimeString()}
          </span>
          {!hasError && <CopyButton text={response.content} />}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main comparison view
// ---------------------------------------------------------------------------

export function ComparisonView({ responses, isLoading }: ComparisonViewProps) {
  const loadingCount = isLoading ? Math.max(responses.length, 3) : 0;

  return (
    <section aria-label="LLM Response Comparison" className="w-full">
      {/* ── Responsive grid: 1 → 2 → 3 columns ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Loading skeletons */}
        {isLoading &&
          Array.from({ length: loadingCount }).map((_, i) => (
            <ComparisonCardSkeleton key={`skeleton-${i}`} />
          ))}

        {/* Actual responses */}
        {!isLoading &&
          responses.map((response) => (
            <ComparisonCard key={response.modelId} response={response} />
          ))}
      </div>

      {/* ── Empty state ── */}
      {!isLoading && responses.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No responses yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Submit a prompt to compare LLM outputs side by side.
          </p>
        </div>
      )}
    </section>
  );
}

export default ComparisonView;
export type { LLMResponse, ComparisonViewProps };
