import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Link2 } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

export function AnalyzeHero() {
  const [url, setUrl] = useState('')
  const navigate = useNavigate()

  function onAnalyze(e: FormEvent) {
    e.preventDefault()
    navigate('/analyze', { state: { draftUrl: url } })
  }

  return (
    <GlassCard strong className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 animated-gradient opacity-30" />
      <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-text-secondary">
            What should I use?
          </h3>
          <Badge tone="accent">Primary CTA</Badge>
        </div>
        <p className="mb-4 max-w-xl text-sm text-text-secondary">
          Paste a product or merchant URL. CARD//OS detects merchant/category heuristics,
          then ranks your cards with the reward engine.
        </p>

        <form
          onSubmit={onAnalyze}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Product or merchant URL</span>
            <Link2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a product or merchant URL..."
              className="h-12 w-full rounded-xl border border-border-soft bg-surface-0/70 pr-4 pl-10 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent/50 focus:ring-4 focus:ring-accent/10"
            />
          </label>
          <Button type="submit" size="lg" className="shrink-0 uppercase tracking-wide">
            Analyze Purchase
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </GlassCard>
  )
}
