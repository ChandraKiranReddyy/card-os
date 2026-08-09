import { Link } from 'react-router-dom'
import { AlertTriangle, Info, XCircle } from 'lucide-react'
import type { AppAlert } from '../types/optimization'
import { cn } from '../lib/cn'

export function AlertsBar({ alerts }: { alerts: AppAlert[] }) {
  if (!alerts.length) return null

  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div
          key={a.id}
          className={cn(
            'flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm',
            a.severity === 'critical' && 'border-danger/25 bg-danger-dim/40',
            a.severity === 'warning' && 'border-warning/25 bg-warning-dim/40',
            a.severity === 'info' && 'border-border-soft bg-white/[0.03]',
          )}
        >
          <SeverityIcon severity={a.severity} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-primary">{a.title}</p>
            <p className="mt-0.5 text-xs text-text-secondary">{a.body}</p>
          </div>
          {a.href && (
            <Link
              to={a.href}
              className="shrink-0 text-xs font-semibold text-accent-soft hover:underline"
            >
              Open
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

function SeverityIcon({ severity }: { severity: AppAlert['severity'] }) {
  if (severity === 'critical') {
    return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
  }
  if (severity === 'warning') {
    return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
  }
  return <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" />
}
