import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Wallet } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { GlassCard } from '../../components/ui/GlassCard'
import { Input } from '../../components/ui/Input'
import { useWallet } from '../../store/WalletContext'
import { INDIA_CARD_CATALOG_V1, listIssuers } from '../../data/cards/india.v1'
import { WalletCardTile } from './WalletCardTile'
import { AddCardModal } from './AddCardModal'
import { EditCardModal } from './EditCardModal'
import type { WalletCard } from '../../types/card'

export function WalletPage() {
  const { cards, country, removeCard } = useWallet()
  const [params, setParams] = useSearchParams()
  const [addOpen, setAddOpen] = useState(false)
  const [editCard, setEditCard] = useState<WalletCard | null>(null)
  const [filter, setFilter] = useState('')
  const [issuer, setIssuer] = useState('all')

  useEffect(() => {
    if (params.get('add') === '1') {
      setAddOpen(true)
      setParams({}, { replace: true })
    }
  }, [params, setParams])

  const issuers = useMemo(() => {
    const fromWallet = cards.map((c) => c.issuer)
    const fromCatalog = country === 'IN' ? listIssuers('IN') : []
    return [...new Set([...fromWallet, ...fromCatalog])].sort()
  }, [cards, country])

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return cards.filter((c) => {
      if (issuer !== 'all' && c.issuer !== issuer) return false
      if (!q) return true
      const hay =
        `${c.issuer} ${c.name} ${c.variant} ${c.nickname} ${c.network}`.toLowerCase()
      return hay.includes(q)
    })
  }, [cards, filter, issuer])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        description="Your cards on this device. Search the catalog, add custom cards, nickname, edit, and remove — data persists after refresh."
        badge="Phase 2"
        action={
          <Button type="button" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add card
          </Button>
        }
      />

      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-text-primary">
            {cards.length} card{cards.length === 1 ? '' : 's'} · {country}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Catalog v{INDIA_CARD_CATALOG_V1.version} · financial rules marked{' '}
            <span className="text-warning">requires verification</span>
          </p>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-text-muted">
          {INDIA_CARD_CATALOG_V1.disclaimer}
        </p>
      </GlassCard>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter wallet…"
          className="sm:max-w-xs"
        />
        <select
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          className="h-11 rounded-xl border border-border-soft bg-surface-1 px-3 text-sm text-text-primary outline-none focus:border-accent/50"
        >
          <option value="all">All issuers</option>
          {issuers.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <GlassCard className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-dim text-accent-soft">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold">
              {cards.length === 0 ? 'Your wallet is empty' : 'No cards match filters'}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {cards.length === 0
                ? 'Add a card from the India catalog or create a custom card. Try fuzzy search like “HDFC infinia”.'
                : 'Clear filters to see all wallet cards.'}
            </p>
          </div>
          {cards.length === 0 && (
            <Button type="button" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add first card
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((card, i) => (
            <WalletCardTile
              key={card.walletId}
              card={card}
              index={i}
              onEdit={() => setEditCard(card)}
              onRemove={() => {
                if (
                  window.confirm(
                    `Remove “${card.nickname || card.name}” from your wallet?`,
                  )
                ) {
                  removeCard(card.walletId)
                }
              }}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <Badge tone="muted">{cards.length} persisted locally</Badge>
        <span>localStorage + IndexedDB mirror · no PAN / CVV / PIN</span>
      </div>

      <AddCardModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditCardModal
        card={editCard}
        open={!!editCard}
        onClose={() => setEditCard(null)}
      />
    </div>
  )
}
