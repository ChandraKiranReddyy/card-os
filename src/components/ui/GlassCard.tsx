import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  strong?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
}

export function GlassCard({
  className,
  strong,
  padding = 'md',
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl panel-glow',
        strong ? 'glass-strong' : 'glass',
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
