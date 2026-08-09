import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, type MouseEvent } from 'react'
import type { DemoCard } from '../../types'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Badge } from '../../components/ui/Badge'
import { cn } from '../../lib/cn'

export function CreditCardVisual({
  card,
  index = 0,
  className,
}: {
  card: DemoCard
  index?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), {
    stiffness: 200,
    damping: 20,
  })

  function onMove(e: MouseEvent) {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function onLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={cn('relative aspect-[1.586/1] w-full max-w-[280px]', className)}
      style={
        reduced
          ? undefined
          : {
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }
      }
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 p-4 shadow-2xl shadow-black/40"
        style={{ background: card.gradient }}
      >
        {/* glass reflection */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-60" />
        <div className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
                {card.issuer}
              </p>
              <p className="mt-0.5 font-display text-sm font-semibold text-white">
                {card.name}
              </p>
            </div>
            {card.nickname && (
              <Badge tone="muted" className="border-white/15 bg-black/20 text-white/70">
                {card.nickname}
              </Badge>
            )}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-white/50">••••  ••••</p>
              <p className="mt-1 text-[11px] font-medium text-white/70">{card.network}</p>
            </div>
            <div
              className="h-7 w-10 rounded-md border border-white/20 bg-white/10 backdrop-blur-sm"
              style={{ boxShadow: `0 0 20px ${card.accent}40` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
