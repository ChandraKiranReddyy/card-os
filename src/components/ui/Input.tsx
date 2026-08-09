import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-border-soft bg-surface-1/80 px-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition',
        'focus:border-accent/50 focus:ring-4 focus:ring-accent/10',
        className,
      )}
      {...props}
    />
  ),
)

Input.displayName = 'Input'
