import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet } from 'lucide-react'
import { greetingForNow, formatINR } from '../../lib/format'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { CreditCardVisual } from './CreditCardVisual'
import { AnalyzeHero } from './AnalyzeHero'
import { StatWidget } from './StatWidget'
import { RewardHealth } from './RewardHealth'
import { SpendingChart } from './SpendingChart'
import { UpcomingBenefits } from './UpcomingBenefits'
import { RecentActivity } from './RecentActivity'
import { OpportunitiesPanel } from './OpportunitiesPanel'
import { useWallet, walletToVisual } from '../../store/WalletContext'
import { useTransactions } from '../../store/TransactionContext'
import { useOptimization } from '../../store/OptimizationContext'
import { usePreferences } from '../../store/PreferencesContext'
import { generateAlerts } from '../../core/alertEngine'
import { walletCardsToProfiles } from '../../core/adapters/walletToProfile'
import { applyTransactionCapUsage } from '../../core/transactions/applyCapUsage'
import { buildAnalytics } from '../../core/analytics'
import { AlertsBar } from '../../components/AlertsBar'
import type { DemoStat } from '../../types'

export function DashboardPage() {
  const reduced = useReducedMotion()
  const greeting = greetingForNow()
  const { cards } = useWallet()
  const { aggregates, transactions } = useTransactions()
  const { milestones, benefits } = useOptimization()
  const { weights } = usePreferences()

  const profiles = useMemo(
    () => applyTransactionCapUsage(walletCardsToProfiles(cards), transactions),
    [cards, transactions],
  )

  const analytics = useMemo(
    () =>
      buildAnalytics({
        transactions,
        walletCards: cards,
        profiles,
        preferences: weights,
      }),
    [transactions, cards, profiles, weights],
  )

  const alerts = useMemo(
    () =>
      generateAlerts({
        profiles,
        transactions,
        milestones,
        benefits,
      }).slice(0, 3),
    [profiles, transactions, milestones, benefits],
  )

  const walletVisuals = cards.map(walletToVisual)
  const hasWallet = walletVisuals.length > 0
  const hasLiveTx = transactions.length > 0

  // Live stats only — no fabricated demo numbers when user has real data;
  // empty zeros with clear labels when cold start.
  const activeStat: DemoStat[] = [
    {
      id: 'est-rewards',
      label: hasLiveTx ? 'Rewards earned' : 'Estimated Rewards',
      value: hasLiveTx ? Math.round(aggregates.totalRewardsEffective) : 0,
      hint: hasLiveTx ? 'from recorded transactions' : 'Record purchases to populate',
      tone: 'positive',
    },
    {
      id: 'capacity',
      label: 'Wallet efficiency',
      value: Math.round(analytics.efficiency.score),
      hint: hasWallet || hasLiveTx
        ? `Grade ${analytics.efficiency.grade} · documented score`
        : 'Add cards & spend to score',
      tone: 'accent',
    },
    {
      id: 'potential',
      label: hasLiveTx ? 'Missed opportunity' : 'Potential Value',
      value: hasLiveTx
        ? Math.round(analytics.missedOpportunity.amount)
        : 0,
      hint: hasLiveTx
        ? '≈ ESTIMATED this month'
        : '≈ ESTIMATED · needs data',
      tone: 'warning',
    },
    {
      id: 'active',
      label: 'Cards Active',
      value: cards.length,
      hint: hasWallet ? 'in your wallet' : 'Add cards in Wallet',
      tone: 'default',
    },
  ]

  const container = {
    hidden: {},
    show: {
      transition: reduced
        ? { staggerChildren: 0 }
        : { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  }

  const item = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduced
        ? { duration: 0 }
        : { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
    },
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.header variants={item}>
        <p className="text-sm font-medium text-text-secondary">{greeting}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
          Your credit card{' '}
          <span className="text-gradient">command center</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          Live rewards, caps, spending, and opportunities from your device data —
          no demo numbers once you start tracking.
        </p>
        {hasLiveTx && (
          <p className="mt-1 text-xs text-text-muted">
            This month: {formatINR(analytics.monthSpending)} spend ·{' '}
            {formatINR(analytics.monthRewards)} rewards
            {analytics.rewardsMomPct != null &&
              ` · MoM ${analytics.rewardsMomPct > 0 ? '+' : ''}${analytics.rewardsMomPct}%`}
          </p>
        )}
      </motion.header>

      <motion.section variants={item}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
              Your Wallet
            </h2>
            <Badge tone={hasWallet ? 'accent' : 'muted'}>
              {hasWallet
                ? `${cards.length} card${cards.length === 1 ? '' : 's'} · local`
                : 'Empty'}
            </Badge>
          </div>
          <Link to="/wallet">
            <Button type="button" variant="secondary" size="sm">
              Manage wallet
            </Button>
          </Link>
        </div>
        {hasWallet ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {walletVisuals.map((card, i) => (
              <div key={card.id} className="flex justify-center sm:justify-start">
                <CreditCardVisual card={card} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Wallet className="h-5 w-5" />}
            title="No cards in wallet"
            description="Add cards to unlock recommendations, efficiency scoring, and cap health."
            action={
              <Link to="/wallet?add=1">
                <Button type="button">Add your first card</Button>
              </Link>
            }
          />
        )}
      </motion.section>

      {alerts.length > 0 && (
        <motion.section variants={item}>
          <AlertsBar alerts={alerts} />
        </motion.section>
      )}

      <motion.section variants={item}>
        <AnalyzeHero />
      </motion.section>

      <motion.section
        variants={item}
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {activeStat.map((stat, i) => (
          <StatWidget key={stat.id} stat={stat} delay={i * 60} />
        ))}
      </motion.section>

      <motion.section variants={item} className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <OpportunitiesPanel
            missed={analytics.missedOpportunity}
            efficiency={analytics.efficiency}
            hasData={hasLiveTx || hasWallet}
          />
        </div>
        <div className="lg:col-span-3">
          <RewardHealth />
        </div>
      </motion.section>

      <motion.section variants={item} className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SpendingChart />
        </div>
        <div className="lg:col-span-2">
          <UpcomingBenefits />
        </div>
      </motion.section>

      <motion.section variants={item}>
        <RecentActivity />
      </motion.section>
    </motion.div>
  )
}
