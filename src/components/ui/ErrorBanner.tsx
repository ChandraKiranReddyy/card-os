import { AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/cn'

export function ErrorBanner({
  message,
  className,
}: {
  message: string
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2 rounded-xl border border-danger/25 bg-danger-dim/50 px-3 py-2.5 text-sm text-danger',
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}
