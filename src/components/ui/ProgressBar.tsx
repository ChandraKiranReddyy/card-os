import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export function ProgressBar({
  value,
  tone = 'accent',
  className,
}: {
  value: number
  tone?: 'accent' | 'positive' | 'warning' | 'danger'
  className?: string
}) {
  const reduced = useReducedMotion()
  const clamped = Math.max(0, Math.min(100, value))
  const colors = {
    accent: 'bg-accent',
    positive: 'bg-positive',
    warning: 'bg-warning',
    danger: 'bg-danger',
  }

  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/5', className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn('h-full rounded-full', colors[tone])}
        initial={reduced ? false : { width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={reduced ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
