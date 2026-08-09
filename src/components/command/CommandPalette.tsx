import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ScanSearch,
  Wallet,
  CreditCard,
  Receipt,
  Gift,
  Sparkles,
  Settings,
  LayoutDashboard,
  BarChart3,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface CommandItem {
  id: string
  label: string
  hint?: string
  icon: typeof ScanSearch
  to: string
  keywords?: string
}

const COMMANDS: CommandItem[] = [
  {
    id: 'analyze',
    label: 'Analyze Purchase',
    hint: 'Primary action',
    icon: ScanSearch,
    to: '/analyze',
    keywords: 'analyze purchase url',
  },
  {
    id: 'add-card',
    label: 'Add Card',
    hint: 'Open wallet add flow',
    icon: CreditCard,
    to: '/wallet?add=1',
    keywords: 'add card wallet',
  },
  {
    id: 'wallet',
    label: 'View Wallet',
    icon: Wallet,
    to: '/wallet',
    keywords: 'wallet cards',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/',
    keywords: 'home dashboard',
  },
  {
    id: 'transactions',
    label: 'View Transactions',
    icon: Receipt,
    to: '/transactions',
    keywords: 'transactions spend',
  },
  {
    id: 'rewards',
    label: 'View Rewards',
    icon: Gift,
    to: '/rewards',
    keywords: 'rewards points',
  },
  {
    id: 'analytics',
    label: 'View Analytics',
    icon: BarChart3,
    to: '/analytics',
    keywords: 'analytics trends efficiency missed opportunity',
  },
  {
    id: 'benefits',
    label: 'View Benefits',
    icon: Sparkles,
    to: '/benefits',
    keywords: 'benefits offers milestones',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    to: '/settings',
    keywords: 'settings preferences',
  },
]

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COMMANDS
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.keywords?.toLowerCase().includes(q) ||
        c.hint?.toLowerCase().includes(q),
    )
  }, [query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
    }
  }, [open])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onOpenChange(false)
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && filtered[active]) {
        e.preventDefault()
        run(filtered[active])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, filtered, active, onOpenChange])

  function run(item: CommandItem) {
    onOpenChange(false)
    navigate(item.to)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
          <motion.button
            type="button"
            aria-label="Close command palette"
            className="absolute inset-0 bg-void/70 backdrop-blur-sm"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.15 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border-soft bg-surface-1 shadow-2xl shadow-black/50"
            initial={reduced ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
          >
            <div className="border-b border-border-subtle px-4 py-3">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command…"
                className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
              />
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-text-muted">
                  No commands match
                </li>
              )}
              {filtered.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => run(item)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                      i === active
                        ? 'bg-accent-dim text-text-primary'
                        : 'text-text-secondary hover:bg-white/[0.03]',
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-accent-soft" />
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.hint && (
                      <span className="text-[10px] font-medium text-text-muted">
                        {item.hint}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 border-t border-border-subtle px-4 py-2 text-[10px] text-text-muted">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
