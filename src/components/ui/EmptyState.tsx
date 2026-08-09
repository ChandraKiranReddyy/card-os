import type { ReactNode } from 'react'
import { GlassCard } from './GlassCard'
import { cn } from '../../lib/cn'

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <GlassCard
      className={cn(
        'flex flex-col items-center justify-center px-6 py-10 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-dim text-accent-soft">
          {icon}
        </div>
      )}
      <h3 className="font-display text-base font-semibold text-text-primary">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </GlassCard>
  )
}
