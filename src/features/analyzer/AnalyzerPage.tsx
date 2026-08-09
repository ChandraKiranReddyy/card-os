import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Link2, ScanSearch } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlassCard } from '../../components/ui/GlassCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useWallet } from '../../store/WalletContext'
import { usePreferences } from '../../store/PreferencesContext'
import { useTransactions } from '../../store/TransactionContext'
import { useOptimization } from '../../store/OptimizationContext'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { walletCardsToProfiles } from '../../core/adapters/walletToProfile'
import { applyTransactionCapUsage } from '../../core/transactions/applyCapUsage'
import { FIXTURE_CARDS } from '../../data/fixtures/engineFixtures'
import {
  draftFromUrl,
  draftIsComplete,
  runAnalysisWithSteps,
} from '../../core/analyzer/analyzePurchase'
import { isKnownMerchantUrl } from '../../core/analyzer/urlParser'
import type { AnalysisResult, AnalysisStep, PurchaseDraft } from '../../types/analyzer'
import { AnalysisSteps } from './AnalysisSteps'
import { ManualFallbackForm } from './ManualFallbackForm'
import { AnalysisResultView } from './AnalysisResultView'

export function AnalyzerPage() {
  const location = useLocation()
  const draftUrl =
    (location.state as { draftUrl?: string } | null)?.draftUrl?.trim() || ''
  const { cards } = useWallet()
  const { weights } = usePreferences()
  const { transactions } = useTransactions()
  const { offers, milestones } = useOptimization()
  const reduced = useReducedMotion()

  const [url, setUrl] = useState(draftUrl)
  const [draft, setDraft] = useState<PurchaseDraft | null>(
    draftUrl ? draftFromUrl(draftUrl) : null,
  )
  const [steps, setSteps] = useState<AnalysisStep[]>([])
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFallback, setShowFallback] = useState(false)

  const walletProfiles = useMemo(
    () => applyTransactionCapUsage(walletCardsToProfiles(cards), transactions),
    [cards, transactions],
  )
  const fixtureProfiles = useMemo(
    () => applyTransactionCapUsage(FIXTURE_CARDS, transactions),
    [transactions],
  )

  useEffect(() => {
    if (draftUrl) {
      setUrl(draftUrl)
      const d = draftFromUrl(draftUrl)
      setDraft(d)
      setShowFallback(d.parse?.needsManualCompletion ?? true)
      setResult(null)
      setError(null)
    }
  }, [draftUrl])

  function handleParse() {
    setError(null)
    setResult(null)
    setSteps([])
    if (!url.trim()) {
      setError('Paste a product or merchant URL, or fill details manually.')
      setShowFallback(true)
      setDraft({
        url: '',
        merchant: '',
        product: '',
        price: null,
        category: 'Shopping',
        country: 'IN',
        currency: 'INR',
        offerValue: 0,
        parse: null,
      })
      return
    }
    const d = draftFromUrl(url)
    setDraft(d)
    setShowFallback(d.parse?.needsManualCompletion ?? !d.parse?.supported)
  }

  async function handleAnalyze(fromDraft?: PurchaseDraft) {
    const active = fromDraft ?? draft
    if (!active) {
      setError('Nothing to analyze yet.')
      return
    }
    const complete = draftIsComplete(active)
    if (!complete.ok) {
      setShowFallback(true)
      setError(
        `We couldn't retrieve all product details. Missing: ${complete.missing.join(', ')}`,
      )
      return
    }

    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const analysis = await runAnalysisWithSteps({
        draft: active,
        walletProfiles,
        fixtureProfiles,
        preferences: weights,
        offers,
        milestones,
        transactions,
        reducedMotion: reduced,
        onStep: setSteps,
      })
      setResult(analysis)
      setShowFallback(false)
    } catch (e) {
      setShowFallback(true)
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleParseAndAnalyze() {
    handleParse()
    // parse is sync; re-read from url
    const d = url.trim()
      ? draftFromUrl(url)
      : draft ?? {
          url: '',
          merchant: '',
          product: '',
          price: null,
          category: 'Shopping',
          country: 'IN',
          currency: 'INR',
          offerValue: 0,
          parse: null,
        }
    setDraft(d)
    if (draftIsComplete(d).ok) {
      await handleAnalyze(d)
    } else {
      setShowFallback(true)
      setError(
        `We couldn't retrieve all product details. Complete the form, then run analysis.`,
      )
    }
  }

  const known = url.trim() ? isKnownMerchantUrl(url) : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyze Purchase"
        description="Paste a URL → detect merchant/category heuristics → rank cards with the Phase 3 engine. No remote scraping."
        badge="Phase 4"
      />

      <GlassCard strong className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 animated-gradient opacity-20" />
        <div className="relative space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <ScanSearch className="h-4 w-4 text-accent-soft" />
            <h2 className="font-display text-sm font-semibold">Product or merchant URL</h2>
            {known === true && <Badge tone="positive">Known merchant domain</Badge>}
            {known === false && url.trim() && (
              <Badge tone="warning">Unsupported / unknown domain</Badge>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">URL</span>
              <Link2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.amazon.in/dp/… or flipkart.com/…"
                className="pl-10 text-base sm:text-sm"
                inputMode="url"
                autoComplete="url"
                enterKeyHint="go"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleParseAndAnalyze()
                }}
              />
            </label>
            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => void handleParseAndAnalyze()}
              disabled={busy}
            >
              {busy ? 'Analyzing…' : 'Analyze Purchase'}
            </Button>
          </div>
          <p className="text-xs text-text-muted">
            Supported domains (heuristics): Amazon, Flipkart, Myntra, Croma, Reliance Digital,
            Swiggy, Zomato, Uber, MakeMyTrip. Prices almost always require manual entry.
          </p>
          <button
            type="button"
            className="text-xs font-semibold text-accent-soft hover:underline"
            onClick={() => {
              setShowFallback(true)
              if (!draft) {
                setDraft({
                  url: url,
                  merchant: '',
                  product: '',
                  price: null,
                  category: 'Shopping',
                  country: 'IN',
                  currency: 'INR',
                  offerValue: 0,
                  parse: null,
                })
              }
            }}
          >
            Skip URL — enter details manually
          </button>
        </div>
      </GlassCard>

      {draft?.parse && (
        <GlassCard>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="font-display text-sm font-semibold">URL parse result</h3>
            <Badge tone={draft.parse.supported ? 'positive' : 'warning'}>
              {draft.parse.supported ? 'Supported merchant' : 'Limited / unsupported'}
            </Badge>
            <Badge tone="muted">≈ ESTIMATED heuristics</Badge>
          </div>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-text-muted">Merchant</dt>
              <dd className="font-medium text-text-primary">
                {draft.parse.merchantName || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Product</dt>
              <dd className="font-medium text-text-primary">
                {draft.parse.productName || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Category</dt>
              <dd className="font-medium text-text-primary">
                {draft.parse.category || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Price</dt>
              <dd className="font-medium text-text-primary">
                {draft.parse.price != null ? `₹${draft.parse.price}` : 'Not in URL'}
              </dd>
            </div>
          </dl>
          <ul className="mt-3 space-y-1">
            {draft.parse.notes.map((n, i) => (
              <li key={i} className="text-xs text-text-muted">
                · {n}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {(showFallback || (draft && !draftIsComplete(draft).ok)) && draft && (
        <ManualFallbackForm
          draft={draft}
          onChange={setDraft}
          onAnalyze={() => void handleAnalyze(draft)}
          busy={busy}
          showWarning
        />
      )}

      {steps.length > 0 && <AnalysisSteps steps={steps} />}

      {error && (
        <GlassCard className="border-warning/20">
          <p className="text-sm text-warning" role="alert">
            {error}
          </p>
        </GlassCard>
      )}

      {result && <AnalysisResultView result={result} />}

      {/* Mobile sticky analyze affordance when scrolled */}
      <div className="fixed inset-x-0 bottom-[4.25rem] z-30 px-4 lg:hidden">
        <Button
          type="button"
          size="lg"
          className="w-full shadow-lg shadow-black/40"
          onClick={() => void handleParseAndAnalyze()}
          disabled={busy}
        >
          {busy ? 'Analyzing…' : 'Analyze Purchase'}
        </Button>
      </div>
    </div>
  )
}
