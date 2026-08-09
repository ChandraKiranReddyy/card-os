import { NavLink } from 'react-router-dom'
import {
  Home,
  Wallet,
  ScanSearch,
  Receipt,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '../../lib/cn'

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/analyze', label: 'Analyze', icon: ScanSearch },
  { to: '/transactions', label: 'Txns', icon: Receipt },
  { to: '/more', label: 'More', icon: MoreHorizontal },
]

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface-0/90 backdrop-blur-xl lg:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition',
                  isActive ? 'text-accent-soft' : 'text-text-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_8px_rgb(124_140_255/0.5)]')}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
