import { Badge } from './Badge'

export function PageHeader({
  title,
  description,
  badge,
  action,
}: {
  title: string
  description?: string
  badge?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
            {title}
          </h1>
          {badge && <Badge tone="muted">{badge}</Badge>}
        </div>
        {description && (
          <p className="mt-1.5 max-w-xl text-sm text-text-secondary">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
