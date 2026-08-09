import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlassCard } from '../../components/ui/GlassCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useTransactions } from '../../store/TransactionContext'
import { formatINR } from '../../lib/format'
import { formatRelativeDate } from '../../core/transactions/aggregates'
import { TransactionFormModal } from './TransactionFormModal'
import type { Transaction } from '../../types/transaction'

export function TransactionsPage() {
  const { transactions, aggregates, addTransaction, updateTransaction, deleteTransaction } =
    useTransactions()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)

  const sorted = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => +new Date(b.date) - +new Date(a.date),
      ),
    [transactions],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Record purchases, track spending, and keep cap utilization in sync. Data stays on this device."
        badge="Phase 5"
        action={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add transaction
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total spending" value={formatINR(aggregates.totalSpending)} />
        <Stat
          label="Rewards earned"
          value={formatINR(aggregates.totalRewardsEffective)}
          tone="positive"
        />
        <Stat label="Offers captured" value={formatINR(aggregates.totalOfferValue)} />
        <Stat label="Transactions" value={String(aggregates.count)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-3 font-display text-sm font-semibold">Spending by card</h3>
          {aggregates.byCard.length === 0 ? (
            <EmptyHint />
          ) : (
            <ul className="space-y-2">
              {aggregates.byCard.map((row) => (
                <li
                  key={row.cardId}
                  className="flex items-center justify-between rounded-xl border border-border-subtle px-3 py-2 text-sm"
                >
                  <span className="font-medium text-text-primary">{row.cardLabel}</span>
                  <span className="text-text-secondary">
                    {formatINR(row.spending)}
                    <span className="ml-2 text-xs text-positive">
                      +{formatINR(row.rewards)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 font-display text-sm font-semibold">
            Spending by category
          </h3>
          {aggregates.byCategory.length === 0 ? (
            <EmptyHint />
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aggregates.byCategory}>
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
                    tickFormatter={(v) => `₹${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#171b26',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value) => formatINR(Number(value ?? 0))}
                  />
                  <Bar dataKey="spending" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {aggregates.byCategory.map((entry) => (
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard padding="none">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h3 className="font-display text-sm font-semibold">Recent transactions</h3>
          <Badge tone="muted">{sorted.length} total</Badge>
        </div>
        {sorted.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-text-secondary">No transactions yet.</p>
            <p className="mt-1 text-xs text-text-muted">
              Analyze a purchase and tap <strong>Mark as used</strong>, or add one here.
            </p>
            <Link
              to="/analyze"
              className="mt-3 inline-block text-sm font-semibold text-accent-soft hover:underline"
            >
              Open analyzer →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {sorted.map((tx) => (
              <li
                key={tx.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">
                      {tx.merchant}
                    </p>
                    <Badge tone="muted">{tx.category}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {tx.product} · {tx.cardLabel} · {formatRelativeDate(tx.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatINR(tx.amount)}
                  </p>
                  <p className="text-[11px] text-positive">
                    ≈ {formatINR(tx.effectiveValue)} · raw {tx.rewardRaw}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditTx(tx)}
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (window.confirm(`Delete transaction at ${tx.merchant}?`)) {
                        deleteTransaction(tx.id)
                      }
                    }}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-danger" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <TransactionFormModal
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSave={(data) => {
          addTransaction(data)
        }}
      />
      <TransactionFormModal
        open={!!editTx}
        mode="edit"
        initial={editTx}
        onClose={() => setEditTx(null)}
        onSave={(data) => {
          if (data.id) updateTransaction(data.id, data)
        }}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'positive'
}) {
  return (
    <GlassCard>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p
        className={`mt-2 font-display text-xl font-semibold tabular-nums ${
          tone === 'positive' ? 'text-positive' : 'text-text-primary'
        }`}
      >
        {value}
      </p>
    </GlassCard>
  )
}

function EmptyHint() {
  return (
    <p className="text-sm text-text-muted">
      Spending breakdown appears after you record transactions.
    </p>
  )
}
