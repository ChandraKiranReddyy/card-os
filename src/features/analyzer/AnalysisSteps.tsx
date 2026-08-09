import { Check, Loader2, Minus, X } from 'lucide-react'
import type { AnalysisStep } from '../../types/analyzer'
import { cn } from '../../lib/cn'
import { GlassCard } from '../../components/ui/GlassCard'

export function AnalysisSteps({ steps }: { steps: AnalysisStep[] }) {
  return (
    <GlassCard>
      <h3 className="mb-3 font-display text-sm font-semibold text-text-primary">
        Analysis progress
      </h3>
      <ul className="space-y-2.5">
        {steps.map((step) => (
          <li key={step.id} className="flex items-start gap-3">
            <StepIcon status={step.status} />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-sm font-medium',
                  step.status === 'done' && 'text-positive',
                  step.status === 'failed' && 'text-danger',
                  step.status === 'running' && 'text-accent-soft',
                  (step.status === 'pending' || step.status === 'skipped') &&
                    'text-text-muted',
                )}
              >
                {step.status === 'done' ? '✓ ' : ''}
                {step.label}
              </p>
              {step.detail && (
                <p className="mt-0.5 text-xs text-text-muted">{step.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  )
}

function StepIcon({ status }: { status: AnalysisStep['status'] }) {
  const base =
    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border'
  if (status === 'done') {
    return (
      <span className={cn(base, 'border-positive/30 bg-positive-dim text-positive')}>
        <Check className="h-3.5 w-3.5" />
      </span>
    )
  }
  if (status === 'running') {
    return (
      <span className={cn(base, 'border-accent/30 bg-accent-dim text-accent-soft')}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      </span>
    )
  }
  if (status === 'failed') {
    return (
      <span className={cn(base, 'border-danger/30 bg-danger-dim text-danger')}>
        <X className="h-3.5 w-3.5" />
      </span>
    )
  }
  if (status === 'skipped') {
    return (
      <span className={cn(base, 'border-border-soft text-text-muted')}>
        <Minus className="h-3.5 w-3.5" />
      </span>
    )
  }
  return (
    <span className={cn(base, 'border-border-subtle text-text-muted')}>
      <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
    </span>
  )
}
