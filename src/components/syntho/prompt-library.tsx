'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Plus,
  Search,
  Trash2,
  Copy,
  FileText,
  BookOpen,
  Lightbulb,
  Code,
  FlaskConical,
} from 'lucide-react'
import { toast } from 'sonner'

// ── Types ────────────────────────────────────────────────────────────────────

interface Prompt {
  id: string
  title: string
  content: string
  category: string
  version: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

interface PromptLibraryProps {
  onLoadPrompt: (prompt: Prompt) => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORIES = ['general', 'research', 'analysis', 'creative', 'technical'] as const
type Category = (typeof CATEGORIES)[number]

const CATEGORY_CONFIG: Record<
  Category,
  { label: string; icon: React.ElementType; badgeClass: string }
> = {
  general: {
    label: 'General',
    icon: FileText,
    badgeClass:
      'bg-muted text-muted-foreground hover:bg-muted/80 border-border',
  },
  research: {
    label: 'Research',
    icon: BookOpen,
    badgeClass:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15',
  },
  analysis: {
    label: 'Analysis',
    icon: Lightbulb,
    badgeClass:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15',
  },
  creative: {
    label: 'Creative',
    icon: FlaskConical,
    badgeClass:
      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/15',
  },
  technical: {
    label: 'Technical',
    icon: Code,
    badgeClass:
      'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20 hover:bg-teal-500/15',
  },
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function PromptLibrary({ onLoadPrompt }: PromptLibraryProps) {
  // State
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState<string>('general')
  const [formContent, setFormContent] = useState('')

  // ── Fetch prompts ────────────────────────────────────────────────────────

  const fetchPrompts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/prompts')
      if (!res.ok) throw new Error('Failed to fetch prompts')
      const data = await res.json()
      setPrompts(Array.isArray(data) ? data : data.prompts ?? [])
    } catch {
      toast.error('Failed to load prompts')
      setPrompts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  // ── Create / save prompt ─────────────────────────────────────────────────

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formContent.trim()) {
      toast.error('Content is required')
      return
    }

    try {
      setSaving(true)
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          content: formContent.trim(),
          category: formCategory,
        }),
      })

      if (!res.ok) throw new Error('Failed to save prompt')

      const responseBody = await res.json()
      const saved: Prompt = responseBody.prompt ?? responseBody

      // If the API returns an auto-versioned prompt, update state accordingly
      const existingIdx = prompts.findIndex(
        (p) => p.title.toLowerCase() === formTitle.trim().toLowerCase()
      )

      if (existingIdx >= 0 && saved.version > 1) {
        // Replace old version with new versioned prompt
        setPrompts((prev) => [saved, ...prev.filter((_, i) => i !== existingIdx)])
        toast.success(`Prompt updated to v${saved.version}`)
      } else {
        setPrompts((prev) => [saved, ...prev])
        toast.success('Prompt saved')
      }

      // Reset form
      setFormTitle('')
      setFormCategory('general')
      setFormContent('')
      setDialogOpen(false)
    } catch {
      toast.error('Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete prompt ────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      const res = await fetch(`/api/prompts?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete prompt')

      setPrompts((prev) => prev.filter((p) => p.id !== id))
      toast.success('Prompt deleted')
    } catch {
      toast.error('Failed to delete prompt')
    } finally {
      setDeletingId(null)
    }
  }

  // ── Copy content ─────────────────────────────────────────────────────────

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    }
  }

  // ── Filtered prompts ─────────────────────────────────────────────────────

  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      categoryFilter === 'all' || p.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Card className="w-full border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Prompt Library
          </CardTitle>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                New Prompt
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Prompt</DialogTitle>
                <DialogDescription>
                  Save a prompt for reuse. If the title matches an existing
                  prompt, it will be automatically versioned.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2 flex flex-col gap-4">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="prompt-title">Title</Label>
                  <Input
                    id="prompt-title"
                    placeholder="e.g. Research Paper Summarizer"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="prompt-category">Category</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger id="prompt-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => {
                        const cfg = CATEGORY_CONFIG[cat]
                        const Icon = cfg.icon
                        return (
                          <SelectItem key={cat} value={cat}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5" />
                              {cfg.label}
                            </span>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="prompt-content">Content</Label>
                  <Textarea
                    id="prompt-content"
                    placeholder="Write your prompt template here..."
                    className="min-h-[160px] resize-y"
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Prompt'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filter Row */}
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat]
                const Icon = cfg.icon
                return (
                  <SelectItem key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-muted/50"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredPrompts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              {searchQuery || categoryFilter !== 'all'
                ? 'No prompts match your search'
                : 'No prompts saved yet'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Click "New Prompt" to create your first one'}
            </p>
          </div>
        )}

        {/* Prompt list */}
        {!loading && filteredPrompts.length > 0 && (
          <Accordion type="multiple" className="w-full">
            {filteredPrompts.map((prompt) => {
              const cfg = CATEGORY_CONFIG[prompt.category as Category] ?? CATEGORY_CONFIG.general
              const CategoryIcon = cfg.icon
              const isDeleting = deletingId === prompt.id

              return (
                <AccordionItem
                  key={prompt.id}
                  value={prompt.id}
                  className="border-border/40"
                >
                  <AccordionTrigger className="hover:no-underline py-3 px-1 group">
                    <div className="flex flex-1 flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-3 text-left">
                      {/* Title & category */}
                      <span className="font-medium text-sm leading-tight truncate max-w-[260px] sm:max-w-none">
                        {prompt.title}
                      </span>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[11px] px-1.5 py-0 font-medium gap-1 ${cfg.badgeClass}`}
                        >
                          <CategoryIcon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>

                        <Badge
                          variant="outline"
                          className="text-[11px] px-1.5 py-0 font-mono text-muted-foreground"
                        >
                          v{prompt.version}
                        </Badge>
                      </div>

                      {/* Date — visible on larger screens */}
                      <span className="hidden lg:inline text-xs text-muted-foreground ml-auto whitespace-nowrap">
                        {formatDate(prompt.updatedAt ?? prompt.createdAt)}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-4 px-1">
                    {/* Prompt content */}
                    <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
                      <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed font-sans text-foreground/90">
                        {prompt.content}
                      </pre>
                    </div>

                    {/* Meta & actions */}
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Created {formatDate(prompt.createdAt)}</span>
                        {prompt.updatedAt !== prompt.createdAt && (
                          <span>Updated {formatDate(prompt.updatedAt)}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1.5 text-xs"
                          onClick={() => handleCopy(prompt.content)}
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 gap-1.5 text-xs"
                          onClick={() => onLoadPrompt(prompt)}
                        >
                          <FileText className="h-3 w-3" />
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(prompt.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3 w-3" />
                          {isDeleting ? '...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}

export default PromptLibrary
