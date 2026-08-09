import { useMemo, useState, type ReactNode } from 'react'
import { Search, AlertTriangle, Plus } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { GlassCard } from '../../components/ui/GlassCard'
import {
  CATALOG_COUNTRIES,
  getAllCatalogCards,
  listIssuers,
} from '../../data/cards/india.v1'
import { formatCatalogLabel, matchCatalogCards } from '../../core/cardMatching'
import type { CatalogCard } from '../../types/card'
import { useWallet } from '../../store/WalletContext'
import { cn } from '../../lib/cn'

type Mode = 'catalog' | 'custom'

export function AddCardModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { country, setCountry, addFromCatalog, addCustom, isCatalogInWallet } =
    useWallet()
  const [mode, setMode] = useState<Mode>('catalog')
  const [query, setQuery] = useState('')
  const [issuerFilter, setIssuerFilter] = useState('all')
  const [selected, setSelected] = useState<CatalogCard | null>(null)
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const [custom, setCustom] = useState({
    issuer: '',
    name: '',
    variant: '',
    network: 'Visa',
    nickname: '',
    annualFee: '',
    rewardType: 'Cashback',
    rewardCurrency: 'Cashback',
    rewardRate: '',
    eligibleCategories: '',
    exclusions: '',
    merchantRules: '',
    redemptionValues: '',
    capsNotes: '',
    milestonesNotes: '',
    benefitsNotes: '',
  })

  const catalog = useMemo(() => getAllCatalogCards(country), [country])
  const issuers = useMemo(() => listIssuers(country), [country])

  const filteredCatalog = useMemo(() => {
    let list = catalog
    if (issuerFilter !== 'all') {
      list = list.filter((c) => c.issuer === issuerFilter)
    }
    if (!query.trim()) return list.map((card) => ({ card, score: 0, uncertain: true }))
    return matchCatalogCards(query, list, { limit: 20, minScore: 30 })
  }, [catalog, issuerFilter, query])

  const topMatch = filteredCatalog[0]
  const autoSelectBlocked =
    !selected &&
    !!query.trim() &&
    (!topMatch || topMatch.uncertain || (filteredCatalog[1] && filteredCatalog[1].score > topMatch.score - 8))

  function resetAndClose() {
    setQuery('')
    setSelected(null)
    setNickname('')
    setMessage(null)
    setMode('catalog')
    onClose()
  }

  function handleAddCatalog() {
    if (!selected) {
      setMessage('Select a card explicitly — uncertain matches are not auto-selected.')
      return
    }
    if (isCatalogInWallet(selected.id)) {
      setMessage('This card is already in your wallet.')
      return
    }
    const added = addFromCatalog(selected, nickname || undefined)
    if (!added) {
      setMessage('Could not add card (duplicate).')
      return
    }
    resetAndClose()
  }

  function handleAddCustom() {
    if (!custom.issuer.trim() || !custom.name.trim() || !custom.network.trim()) {
      setMessage('Issuer, card name, and network are required.')
      return
    }
    addCustom({
      isCustom: true,
      country,
      issuer: custom.issuer,
      name: custom.name,
      variant: custom.variant,
      network: custom.network,
      nickname: custom.nickname || custom.name,
      annualFee: custom.annualFee ? Number(custom.annualFee) : null,
      rewardType: custom.rewardType,
      rewardCurrency: custom.rewardCurrency,
      rewardRate: custom.rewardRate ? Number(custom.rewardRate) : null,
      eligibleCategories: custom.eligibleCategories,
      exclusions: custom.exclusions,
      merchantRules: custom.merchantRules,
      redemptionValues: custom.redemptionValues,
      capsNotes: custom.capsNotes,
      milestonesNotes: custom.milestonesNotes,
      benefitsNotes: custom.benefitsNotes,
    })
    resetAndClose()
  }

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Add card"
      description="Search the catalog or create a custom card. No card numbers required."
      wide
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === 'catalog' ? 'primary' : 'secondary'}
          onClick={() => {
            setMode('catalog')
            setMessage(null)
          }}
        >
          From catalog
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === 'custom' ? 'primary' : 'secondary'}
          onClick={() => {
            setMode('custom')
            setMessage(null)
          }}
        >
          Custom card
        </Button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-text-secondary">
          Country
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value)
              setSelected(null)
              setIssuerFilter('all')
            }}
            className="mt-1.5 h-11 w-full rounded-xl border border-border-soft bg-surface-0 px-3 text-sm text-text-primary outline-none focus:border-accent/50"
          >
            {CATALOG_COUNTRIES.map((c) => (
              <option
                key={c.code}
                value={c.code}
                disabled={'disabled' in c && c.disabled}
              >
                {c.label}
                {'disabled' in c && c.disabled ? ' (soon)' : ''}
              </option>
            ))}
          </select>
        </label>
        {mode === 'catalog' && (
          <label className="block text-xs font-medium text-text-secondary">
            Issuer filter
            <select
              value={issuerFilter}
              onChange={(e) => setIssuerFilter(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-border-soft bg-surface-0 px-3 text-sm text-text-primary outline-none focus:border-accent/50"
            >
              <option value="all">All issuers</option>
              {issuers.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {mode === 'catalog' ? (
        <>
          <label className="relative mb-3 block">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelected(null)
              }}
              placeholder='Search e.g. "HDFC infinia" or "SBI cashback"'
              className="pl-10"
            />
          </label>

          {autoSelectBlocked && query.trim() && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-warning/20 bg-warning-dim px-3 py-2 text-xs text-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Multiple or uncertain matches — select a card explicitly. Nothing is
                auto-added.
              </span>
            </div>
          )}

          <ul className="mb-4 max-h-56 space-y-1.5 overflow-y-auto scroll-thin">
            {filteredCatalog.length === 0 && (
              <li className="rounded-xl border border-border-subtle px-3 py-6 text-center text-sm text-text-muted">
                No catalog cards match.
                <button
                  type="button"
                  className="mt-2 block w-full text-accent-soft underline"
                  onClick={() => setMode('custom')}
                >
                  Create a custom card instead
                </button>
              </li>
            )}
            {filteredCatalog.map(({ card, score, uncertain }) => {
              const inWallet = isCatalogInWallet(card.id)
              const active = selected?.id === card.id
              return (
                <li key={card.id}>
                  <button
                    type="button"
                    disabled={inWallet}
                    onClick={() => {
                      setSelected(card)
                      setNickname(card.name)
                      setMessage(null)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition',
                      active
                        ? 'border-accent/40 bg-accent-dim'
                        : 'border-border-subtle hover:border-border-soft hover:bg-white/[0.03]',
                      inWallet && 'cursor-not-allowed opacity-45',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {formatCatalogLabel(card)}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {card.network} · {card.rewardCurrency}
                        {query.trim() ? ` · match ${Math.round(score)}%` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {inWallet && <Badge tone="muted">In wallet</Badge>}
                      {uncertain && query.trim() && !inWallet && (
                        <Badge tone="warning">Uncertain</Badge>
                      )}
                      <Badge tone="warning">Unverified rules</Badge>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>

          {selected && (
            <GlassCard className="mb-4" padding="sm">
              <p className="text-xs text-text-secondary">
                Selected:{' '}
                <span className="font-medium text-text-primary">
                  {formatCatalogLabel(selected)}
                </span>
              </p>
              <label className="mt-2 block text-xs font-medium text-text-secondary">
                Nickname
                <Input
                  className="mt-1"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Primary travel"
                />
              </label>
            </GlassCard>
          )}

          {message && (
            <p className="mb-3 text-xs text-warning" role="status">
              {message}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddCatalog} disabled={!selected}>
              <Plus className="h-4 w-4" />
              Add to wallet
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-3 text-xs text-text-muted">
            Custom cards are labeled ✎ USER PROVIDED. Enter only what you know —
            leave rates blank rather than guessing.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Issuer *">
              <Input
                value={custom.issuer}
                onChange={(e) => setCustom({ ...custom, issuer: e.target.value })}
                placeholder="e.g. HDFC Bank"
              />
            </Field>
            <Field label="Card name *">
              <Input
                value={custom.name}
                onChange={(e) => setCustom({ ...custom, name: e.target.value })}
                placeholder="e.g. Infinia"
              />
            </Field>
            <Field label="Variant">
              <Input
                value={custom.variant}
                onChange={(e) => setCustom({ ...custom, variant: e.target.value })}
                placeholder="e.g. Metal"
              />
            </Field>
            <Field label="Network *">
              <Input
                value={custom.network}
                onChange={(e) => setCustom({ ...custom, network: e.target.value })}
                placeholder="Visa / Mastercard / Amex"
              />
            </Field>
            <Field label="Nickname">
              <Input
                value={custom.nickname}
                onChange={(e) => setCustom({ ...custom, nickname: e.target.value })}
              />
            </Field>
            <Field label="Annual fee (optional)">
              <Input
                inputMode="decimal"
                value={custom.annualFee}
                onChange={(e) => setCustom({ ...custom, annualFee: e.target.value })}
                placeholder="Leave blank if unknown"
              />
            </Field>
            <Field label="Reward type">
              <Input
                value={custom.rewardType}
                onChange={(e) => setCustom({ ...custom, rewardType: e.target.value })}
              />
            </Field>
            <Field label="Reward currency">
              <Input
                value={custom.rewardCurrency}
                onChange={(e) =>
                  setCustom({ ...custom, rewardCurrency: e.target.value })
                }
              />
            </Field>
            <Field label="Reward rate (optional)">
              <Input
                inputMode="decimal"
                value={custom.rewardRate}
                onChange={(e) => setCustom({ ...custom, rewardRate: e.target.value })}
                placeholder="Do not invent — blank if unsure"
              />
            </Field>
            <Field label="Eligible categories">
              <Input
                value={custom.eligibleCategories}
                onChange={(e) =>
                  setCustom({ ...custom, eligibleCategories: e.target.value })
                }
              />
            </Field>
            <Field label="Exclusions">
              <Input
                value={custom.exclusions}
                onChange={(e) => setCustom({ ...custom, exclusions: e.target.value })}
              />
            </Field>
            <Field label="Merchant rules">
              <Input
                value={custom.merchantRules}
                onChange={(e) =>
                  setCustom({ ...custom, merchantRules: e.target.value })
                }
              />
            </Field>
            <Field label="Caps">
              <Input
                value={custom.capsNotes}
                onChange={(e) => setCustom({ ...custom, capsNotes: e.target.value })}
              />
            </Field>
            <Field label="Redemption values">
              <Input
                value={custom.redemptionValues}
                onChange={(e) =>
                  setCustom({ ...custom, redemptionValues: e.target.value })
                }
              />
            </Field>
            <Field label="Milestones">
              <Input
                value={custom.milestonesNotes}
                onChange={(e) =>
                  setCustom({ ...custom, milestonesNotes: e.target.value })
                }
              />
            </Field>
            <Field label="Benefits">
              <Input
                value={custom.benefitsNotes}
                onChange={(e) =>
                  setCustom({ ...custom, benefitsNotes: e.target.value })
                }
              />
            </Field>
          </div>

          {message && (
            <p className="mt-3 text-xs text-warning" role="status">
              {message}
            </p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddCustom}>
              <Plus className="h-4 w-4" />
              Save custom card
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block text-xs font-medium text-text-secondary">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
