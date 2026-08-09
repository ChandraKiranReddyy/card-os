import { GlassCard } from '../../components/ui/GlassCard'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Badge } from '../../components/ui/Badge'
import { DEMO_HEALTH } from '../../data/demo'
import { useWallet } from '../../store/WalletContext'
import { useTransactions } from '../../store/TransactionContext'
import { walletCardToProfile } from '../../core/adapters/walletToProfile'
import { applyTransactionCapUsage } from '../../core/transactions/applyCapUsage'
import { formatINR } from '../../lib/format'

function toneFor(status: string): 'positive' | 'warning' | 'accent' {
  if (status === 'healthy') return 'positive'
  if (status === 'cap') return 'warning'
  return 'accent'
}

function barTone(
  status: string,
  progress?: number,
): 'positive' | 'warning' | 'danger' | 'accent' {
  if (status === 'healthy') return 'positive'
  if (status === 'cap' && (progress ?? 0) >= 90) return 'danger'
  if (status === 'cap') return 'warning'
  return 'accent'
}

export function RewardHealth() {
  const { cards } = useWallet()
  const { transactions } = useTransactions()

  const liveItems =
    cards.length > 0
      ? applyTransactionCapUsage(
          cards.map(walletCardToProfile),
          transactions,
        ).map((profile) => {
          const monthly = profile.caps.find((c) => c.period === 'monthly')
          if (monthly && monthly.limit > 0) {
            const progress = Math.min(100, Math.round((monthly.used / monthly.limit) * 100))
            return {
              id: profile.id,
              cardName: profile.label,
              status: progress >= 100 ? 'cap' : progress >= 60 ? 'cap' : 'healthy',
              detail: `${formatINR(monthly.used)} / ${formatINR(monthly.limit)} cap used`,
              progress,
            }
          }
          const rewardSum = transactions
            .filter((t) => t.cardId === profile.id)
            .reduce((s, t) => s + t.effectiveValue, 0)
          return {
            id: profile.id,
            cardName: profile.label,
            status: 'healthy' as const,
            detail:
              rewardSum > 0
                ? `${formatINR(rewardSum)} rewards recorded`
                : 'No monthly cap configured · healthy',
            progress: rewardSum > 0 ? 40 : 100,
          }
        })
      : []

  const items = liveItems.length > 0 ? liveItems : DEMO_HEALTH
  const live = liveItems.length > 0

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-text-primary">
          Reward Health
        </h3>
        <Badge tone={live ? 'accent' : 'muted'}>{live ? 'Live caps' : 'Demo'}</Badge>
      </div>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-text-primary">
                {item.cardName}
              </span>
              <Badge tone={toneFor(item.status)}>
                {item.status === 'healthy'
                  ? 'Healthy'
                  : item.status === 'cap'
                    ? 'Cap'
                    : 'Milestone'}
              </Badge>
            </div>
            <p className="mb-2 text-xs text-text-secondary">{item.detail}</p>
            {item.progress != null && (
              <ProgressBar
                value={item.progress}
                tone={barTone(item.status, item.progress)}
              />
            )}
          </li>
        ))}
      </ul>
    </GlassCard>
  )
}
