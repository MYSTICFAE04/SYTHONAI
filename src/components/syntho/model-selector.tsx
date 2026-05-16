'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description: string;
  strengths: string[];
  color: string;
  icon: string;
}

interface ModelSelectorProps {
  selectedModels: string[];
  onSelectionChange: (modelIds: string[]) => void;
  minSelected?: number;
  maxSelected?: number;
}

export function ModelSelector({
  selectedModels,
  onSelectionChange,
  minSelected = 2,
  maxSelected = 5,
}: ModelSelectorProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        const res = await fetch('/api/models');
        if (!res.ok) throw new Error('Failed to fetch models');
        const data = await res.json();
        setModels(data.models ?? data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchModels();
  }, []);

  const toggleModel = useCallback(
    (modelId: string) => {
      const isSelected = selectedModels.includes(modelId);
      if (isSelected) {
        if (selectedModels.length <= minSelected) return;
        onSelectionChange(selectedModels.filter((id) => id !== modelId));
      } else {
        if (selectedModels.length >= maxSelected) return;
        onSelectionChange([...selectedModels, modelId]);
      }
    },
    [selectedModels, onSelectionChange, minSelected, maxSelected]
  );

  const selectAll = useCallback(() => {
    if (models.length <= maxSelected) {
      onSelectionChange(models.map((m) => m.id));
    } else {
      onSelectionChange(models.slice(0, maxSelected).map((m) => m.id));
    }
  }, [models, maxSelected, onSelectionChange]);

  const clearAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 py-12">
        <p className="text-sm font-medium text-destructive">
          Failed to load models
        </p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold tracking-tight">Select Models</h3>
          <Badge variant="secondary" className="tabular-nums">
            {selectedModels.length} / {maxSelected} selected
          </Badge>
          {selectedModels.length < minSelected && (
            <span className="text-xs text-muted-foreground">
              Select at least {minSelected}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            disabled={selectedModels.length >= maxSelected}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={selectedModels.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          const isAtMax = selectedModels.length >= maxSelected && !isSelected;
          const isAtMin = selectedModels.length <= minSelected && isSelected;

          return (
            <Card
              key={model.id}
              onClick={() => {
                if (!isAtMax || isSelected) toggleModel(model.id);
              }}
              className={`group relative cursor-pointer transition-all duration-200 ease-out
                ${isSelected
                  ? 'border-2 shadow-md'
                  : isAtMax
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:border-muted-foreground/30 hover:shadow-sm'
                }
              `}
              style={
                isSelected
                  ? {
                      borderColor: model.color,
                      boxShadow: `0 0 0 1px ${model.color}40, 0 4px 16px ${model.color}20`,
                    }
                  : undefined
              }
            >
              {/* Selection indicator */}
              {isSelected && (
                <div
                  className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full"
                  style={{ backgroundColor: model.color }}
                >
                  <Check className="size-3.5 text-white" strokeWidth={3} />
                </div>
              )}

              <CardContent className="p-5">
                <div className="flex items-start gap-3.5">
                  {/* Model Icon */}
                  <div
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg text-xl"
                    style={{
                      backgroundColor: `${model.color}15`,
                      color: model.color,
                    }}
                  >
                    {model.icon}
                  </div>

                  {/* Model Info */}
                  <div className="min-w-0 flex-1 space-y-1.5 pr-6">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold leading-tight">
                        {model.name}
                      </span>
                    </div>
                    <span
                      className="inline-block text-xs font-medium"
                      style={{ color: model.color }}
                    >
                      {model.provider}
                    </span>
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {model.description}
                    </p>
                  </div>
                </div>

                {/* Strength Badges */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {model.strengths.map((strength) => (
                    <Badge
                      key={strength}
                      variant="outline"
                      className="text-[10px] font-medium px-1.5 py-0 h-5"
                      style={{
                        borderColor: `${model.color}50`,
                        color: isSelected ? model.color : undefined,
                        backgroundColor: isSelected
                          ? `${model.color}10`
                          : undefined,
                      }}
                    >
                      {strength}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              {/* Bottom accent bar */}
              <div
                className={`h-0.5 w-full rounded-b-xl transition-opacity duration-200 ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                }`}
                style={{ backgroundColor: model.color }}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
