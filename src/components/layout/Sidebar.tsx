import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  ScanSearch,
  Receipt,
  Gift,
  Sparkles,
  Settings,
  Command,
  BarChart3,
} from 'lucide-react'
import { cn } from '../../lib/cn'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/analyze', label: 'Analyze', icon: ScanSearch },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/benefits', label: 'Benefits', icon: Sparkles },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ onOpenCommand }: { onOpenCommand: () => void }) {
  return (
    <aside className="hidden h-full w-[240px] shrink-0 flex-col border-r border-border-subtle bg-surface-0/80 lg:flex">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-accent-dim font-display text-xs font-bold tracking-tight text-accent-soft">
          C//
        </div>
        <div>
          <div className="font-display text-sm font-semibold tracking-wide text-text-primary">
            CARD//OS
          </div>
          <div className="text-[10px] font-medium text-text-muted">
            Credit card OS
          </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <NavLink
          to="/analyze"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-void shadow-[0_0_28px_rgb(124_140_255/0.22)] transition hover:bg-accent-soft"
        >
          <ScanSearch className="h-4 w-4" />
          Analyze Purchase
        </NavLink>
      </div>

      <nav className="scroll-thin flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
          Navigate
        </p>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition',
                isActive
                  ? 'bg-white/[0.06] font-semibold text-text-primary'
                  : 'font-medium text-text-secondary hover:bg-white/[0.03] hover:text-text-primary',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'h-4 w-4',
                    isActive ? 'text-accent-soft' : 'text-text-muted group-hover:text-text-secondary',
                  )}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border-subtle p-3">
        <button
          type="button"
          onClick={onOpenCommand}
          className="flex w-full items-center justify-between rounded-xl border border-border-subtle bg-surface-1 px-3 py-2.5 text-left transition hover:border-border-soft hover:bg-surface-2"
        >
          <span className="flex items-center gap-2 text-xs font-medium text-text-secondary">
            <Command className="h-3.5 w-3.5" />
            Command
          </span>
          <kbd className="rounded-md border border-border-soft bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-text-muted">
            ⌘K
          </kbd>
        </button>
      </div>
    </aside>
  )
}
