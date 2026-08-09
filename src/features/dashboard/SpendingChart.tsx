import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'
import { GlassCard } from '../../components/ui/GlassCard'
import { Badge } from '../../components/ui/Badge'
import { DEMO_SPEND } from '../../data/demo'
import { formatINR } from '../../lib/format'
import { useTransactions } from '../../store/TransactionContext'

function CustomTooltip({
  active,
  payload,
  label,
  live,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  live?: boolean
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border-soft bg-surface-2 px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-text-primary">{label}</p>
      <p className="mt-0.5 text-text-secondary">{formatINR(payload[0].value)}</p>
      <p className="mt-1 text-[10px] text-text-muted">
        {live ? 'From your transactions' : '≈ ESTIMATED · demo'}
      </p>
    </div>
  )
}

export function SpendingChart() {
  const { aggregates, transactions } = useTransactions()
  const live = transactions.length > 0
  const data = live
    ? aggregates.byCategory.map((c) => ({
        category: c.category,
        amount: c.spending,
        color: c.color,
      }))
    : DEMO_SPEND

  return (
    <GlassCard className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold text-text-primary">
            Spending Intelligence
          </h3>
          <p className="mt-0.5 text-xs text-text-muted">
            {live ? 'Category mix · live transactions' : 'Category mix · demo data'}
          </p>
        </div>
        <Badge tone={live ? 'accent' : 'muted'}>{live ? 'Live' : 'Demo'}</Badge>
      </div>
      <div className="h-56 w-full sm:h-64">
        {data.length === 0 ? (
          <p className="pt-10 text-center text-sm text-text-muted">No spending yet</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <XAxis
                dataKey="category"
                tick={{ fill: '#6b7385', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={48}
              />
              <YAxis
                tick={{ fill: '#6b7385', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip
                content={<CustomTooltip live={live} />}
                cursor={{ fill: 'rgb(255 255 255 / 0.03)' }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={36}>
                {data.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  )
}
