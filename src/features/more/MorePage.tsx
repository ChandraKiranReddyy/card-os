import { Link } from 'react-router-dom'
import {
  Gift,
  Settings,
  Sparkles,
  ChevronRight,
  BarChart3,
  Receipt,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlassCard } from '../../components/ui/GlassCard'

const links = [
  { to: '/wallet', label: 'Wallet', desc: 'Your cards', icon: Wallet },
  { to: '/transactions', label: 'Transactions', desc: 'Spending history', icon: Receipt },
  { to: '/rewards', label: 'Rewards', desc: 'Engine playground', icon: Gift },
  { to: '/analytics', label: 'Analytics', desc: 'Trends & efficiency', icon: BarChart3 },
  { to: '/benefits', label: 'Benefits', desc: 'Offers & milestones', icon: Sparkles },
  { to: '/settings', label: 'Settings', desc: 'Privacy & preferences', icon: Settings },
]

export function MorePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="More"
        description="Additional destinations for mobile navigation."
      />
      <ul className="space-y-2">
        {links.map((item) => (
          <li key={item.to}>
            <Link to={item.to}>
              <GlassCard className="flex items-center gap-3 transition hover:border-border-soft hover:bg-white/[0.03] active:scale-[0.99]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-dim text-accent-soft">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-text-muted" />
              </GlassCard>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
