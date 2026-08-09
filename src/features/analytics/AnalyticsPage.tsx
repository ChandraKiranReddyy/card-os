import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlassCard } from '../../components/ui/GlassCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { EmptyState } from '../../components/ui/EmptyState'
import { useWallet } from '../../store/WalletContext'
import { useTransactions } from '../../store/TransactionContext'
import { usePreferences } from '../../store/PreferencesContext'
import { walletCardsToProfiles } from '../../core/adapters/walletToProfile'
import { applyTransactionCapUsage } from '../../core/transactions/applyCapUsage'
import { buildAnalytics } from '../../core/analytics'
import { formatINR } from '../../lib/format'
import { BarChart3 } from 'lucide-react'

export function AnalyticsPage() {
  const { cards } = useWallet()
  const { transactions } = useTransactions()
  const { weights } = usePreferences()

  const analytics = useMemo(() => {
    const profiles = applyTransactionCapUsage(
      walletCardsToProfiles(cards),
      transactions,
    )
    return buildAnalytics({
      transactions,
      walletCards: cards,
      profiles,
      preferences: weights,
    })
  }, [cards, transactions, weights])

  const empty = transactions.length === 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Spending and reward trends, card performance, category yield, missed opportunity, and wallet efficiency — all from your local data."
        badge="Phase 7"
        action={
          <Link to="/transactions">
            <Button type="button" variant="secondary" size="sm">
              Transactions
            </Button>
          </Link>
        }
      />

      {empty ? (
        <EmptyState
          icon={<BarChart3 className="h-5 w-5" />}
          title="No analytics yet"
          description="Record purchases (Analyze → Mark as used) to unlock trends, efficiency, and missed-opportunity estimates."
          action={
            <Link to="/analyze">
              <Button type="button">Analyze a purchase</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric
              label="This month spend"
              value={formatINR(analytics.monthSpending)}
            />
            <Metric
              label="This month rewards"
              value={formatINR(analytics.monthRewards)}
              tone="positive"
            />
            <Metric
              label="Rewards MoM"
              value={
                analytics.rewardsMomPct == null
                  ? '—'
                  : `${analytics.rewardsMomPct > 0 ? '+' : ''}${analytics.rewardsMomPct}%`
              }
              hint="vs last month"
            />
            <Metric
              label="Efficiency"
              value={`${analytics.efficiency.score}`}
              hint={`Grade ${analytics.efficiency.grade}`}
              tone="accent"
            />
          </div>

          {/* Missed opportunity */}
          <GlassCard strong>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-sm font-semibold">
                    Missed opportunity
                  </h2>
                  <Badge tone="warning">
                    {analytics.missedOpportunity.label}
                  </Badge>
                </div>
                <p className="mt-2 font-display text-2xl font-semibold text-warning tabular-nums">
                  {formatINR(analytics.missedOpportunity.amount)}
                </p>
                <p className="mt-2 max-w-2xl text-sm text-text-secondary">
                  {analytics.missedOpportunity.explanation}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Trends */}
          <div className="grid gap-4 lg:grid-cols-2">
            <GlassCard>
              <h3 className="mb-1 font-display text-sm font-semibold">
                Spending · last 30 days
              </h3>
              <p className="mb-3 text-xs text-text-muted">Daily totals</p>
              <ChartArea
                data={analytics.spendingTrendDaily}
                dataKey="spending"
                color="#7c8cff"
              />
            </GlassCard>
            <GlassCard>
              <h3 className="mb-1 font-display text-sm font-semibold">
                Rewards · last 6 months
              </h3>
              <p className="mb-3 text-xs text-text-muted">Month-over-month effective value</p>
              <ChartArea
                data={analytics.rewardsTrendMonthly}
                dataKey="rewards"
                color="#34d399"
              />
            </GlassCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <GlassCard>
              <h3 className="mb-3 font-display text-sm font-semibold">
                Card performance
              </h3>
              {analytics.cardPerformance.length === 0 ? (
                <p className="text-sm text-text-muted">No card data</p>
              ) : (
                <ul className="space-y-2">
                  {analytics.cardPerformance.map((c, i) => (
                    <li
                      key={c.cardId}
                      className="flex items-center justify-between rounded-xl border border-border-subtle px-3 py-2 text-sm"
                    >
                      <div>
                        <span className="mr-2 font-mono text-xs text-text-muted">
                          #{i + 1}
                        </span>
                        <span className="font-medium">{c.cardLabel}</span>
                        <p className="text-[11px] text-text-muted">
                          {c.txCount} tx · {c.rewardRatePct}% yield
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-positive">
                          {formatINR(c.rewards)}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          on {formatINR(c.spending)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>

            <GlassCard>
              <h3 className="mb-1 font-display text-sm font-semibold">
                Category optimization
              </h3>
              <p className="mb-3 text-xs text-text-muted">
                Sorted by lowest reward yield first (opportunity to improve)
              </p>
              {analytics.categoryOptimization.length === 0 ? (
                <p className="text-sm text-text-muted">No category data</p>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.categoryOptimization}>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis
                        dataKey="category"
                        tick={{ fill: '#6b7385', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#6b7385', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        unit="%"
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#171b26',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                        formatter={(v) => [`${Number(v ?? 0)}% yield`, 'Yield']}
                      />
                      <Bar
                        dataKey="rewardRatePct"
                        fill="#a78bfa"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Efficiency breakdown */}
          <GlassCard>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3 className="font-display text-sm font-semibold">
                Wallet efficiency
              </h3>
              <Badge tone="accent">Grade {analytics.efficiency.grade}</Badge>
              <Badge tone="muted">Documented formula</Badge>
            </div>
            <p className="mb-4 font-mono text-[11px] text-text-muted">
              {analytics.efficiency.formula}
            </p>
            <div className="mb-4 flex items-end gap-3">
              <p className="font-display text-4xl font-semibold tabular-nums text-accent-soft">
                {analytics.efficiency.score}
              </p>
              <p className="pb-1 text-sm text-text-muted">/ 100</p>
            </div>
            <ul className="space-y-3">
              {analytics.efficiency.components.map((c) => (
                <li key={c.id}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-text-secondary">
                      {c.label}{' '}
                      <span className="text-text-muted">
                        (w {c.weight})
                      </span>
                    </span>
                    <span className="tabular-nums text-text-primary">{c.score}</span>
                  </div>
                  <ProgressBar value={c.score} tone="accent" />
                  <p className="mt-1 text-[11px] text-text-muted">{c.explanation}</p>
                </li>
              ))}
            </ul>
          </GlassCard>
        </>
      )}
    </div>
  )
}

function Metric({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint?: string
  tone?: 'positive' | 'accent'
}) {
  return (
    <GlassCard>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p
        className={`mt-2 font-display text-xl font-semibold tabular-nums ${
          tone === 'positive'
            ? 'text-positive'
            : tone === 'accent'
              ? 'text-accent-soft'
              : 'text-text-primary'
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-text-muted">{hint}</p>}
    </GlassCard>
  )
}

function ChartArea({
  data,
  dataKey,
  color,
}: {
  data: Array<{ label: string; spending: number; rewards: number }>
  dataKey: 'spending' | 'rewards'
  color: string
}) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#6b7385', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#6b7385', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v >= 1000 ? `₹${v / 1000}k` : `₹${v}`)}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: '#171b26',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(v) => [formatINR(Number(v ?? 0)), dataKey]}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={`url(#g-${dataKey})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
