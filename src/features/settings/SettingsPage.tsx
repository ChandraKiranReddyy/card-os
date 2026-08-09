import { useRef, useState } from 'react'
import { Download, Upload, Trash2, Shield } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlassCard } from '../../components/ui/GlassCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { usePreferences } from '../../store/PreferencesContext'
import type { UserPreferenceWeights } from '../../types/engine'
import {
  downloadJsonFile,
  exportAllDataJson,
  importAllData,
  parseImportJson,
  resetAllLocalData,
  LOCAL_STORAGE_KEYS,
} from '../../core/dataPortability'
import { ErrorBanner } from '../../components/ui/ErrorBanner'

const LABELS: Record<keyof UserPreferenceWeights, string> = {
  travel: 'Travel redemptions',
  cashback: 'Cashback preference',
  hotels: 'Hotel redemptions',
  shopping: 'Shopping redemptions',
  maximumValue: 'Maximum value (override)',
}

export function SettingsPage() {
  const { weights, updateWeight, reset } = usePreferences()
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  function handleExport() {
    setError(null)
    try {
      const json = exportAllDataJson(true)
      const stamp = new Date().toISOString().slice(0, 10)
      downloadJsonFile(`cardos-backup-${stamp}.json`, json)
      setStatus('Export downloaded. Keep this file private — it has your local wallet history.')
    } catch {
      setError('Could not export data. Try again.')
    }
  }

  async function handleImportFile(file: File) {
    setError(null)
    setStatus(null)
    try {
      const text = await file.text()
      const result = parseImportJson(text)
      if (!result.ok) {
        setError(result.error)
        return
      }
      importAllData(result.data)
      setStatus('Import successful. Reloading to apply data…')
      window.setTimeout(() => window.location.reload(), 600)
    } catch {
      setError('Could not read that file. Use a JSON export from CARD//OS.')
    }
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true)
      setStatus('Click “Delete all local data” again to confirm. This cannot be undone.')
      return
    }
    setError(null)
    resetAllLocalData()
    setStatus('All local data deleted. Reloading…')
    window.setTimeout(() => window.location.reload(), 500)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Preferences, privacy, and local data tools. Everything stays on this device."
        badge="Phase 8"
      />

      {error && <ErrorBanner message={error} />}
      {status && (
        <div
          role="status"
          className="rounded-xl border border-border-soft bg-white/[0.03] px-3 py-2 text-sm text-text-secondary"
        >
          {status}
        </div>
      )}

      <GlassCard>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-sm font-semibold">Reward strategy weights</h2>
          <Badge tone="accent">Persisted locally</Badge>
        </div>
        <p className="mb-4 text-xs text-text-muted">
          When Maximum value is highest, the engine picks the best redemption rate. Otherwise
          it prefers channels aligned with your weights. Weights are relative (0–5).
        </p>
        <div className="space-y-4">
          {(Object.keys(LABELS) as Array<keyof UserPreferenceWeights>).map((key) => (
            <label key={key} className="block">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-text-secondary">{LABELS[key]}</span>
                <span className="tabular-nums text-text-primary">{weights[key]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={weights[key]}
                onChange={(e) => updateWeight(key, Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={weights[key]}
                aria-label={LABELS[key]}
              />
            </label>
          ))}
        </div>
        <div className="mt-4">
          <Button type="button" variant="secondary" size="sm" onClick={reset}>
            Reset preference defaults
          </Button>
        </div>
      </GlassCard>

      {/* Data tools */}
      <GlassCard>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-sm font-semibold">My data</h2>
          <Badge tone="positive">Local only</Badge>
        </div>
        <p className="mb-4 text-xs text-text-muted">
          Export a JSON backup, restore it later, or wipe everything. Keys:{' '}
          {LOCAL_STORAGE_KEYS.join(', ')}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export my data
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Import my data
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="Import CARD//OS JSON backup"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void handleImportFile(f)
              e.target.value = ''
            }}
          />
        </div>
      </GlassCard>

      <GlassCard className="border-danger/20">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-sm font-semibold text-danger">Danger zone</h2>
          <Badge tone="danger">Irreversible</Badge>
        </div>
        <p className="mb-4 text-xs text-text-secondary">
          Deletes wallet, transactions, preferences, offers, milestones, and benefits from this
          browser. Export a backup first if you may need it.
        </p>
        <Button type="button" variant="danger" onClick={handleReset}>
          <Trash2 className="h-4 w-4" />
          {confirmReset ? 'Confirm delete all local data' : 'Delete all local data'}
        </Button>
        {confirmReset && (
          <button
            type="button"
            className="ml-3 text-xs text-text-muted underline"
            onClick={() => setConfirmReset(false)}
          >
            Cancel
          </button>
        )}
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-positive" />
            <h2 className="font-display text-sm font-semibold">Privacy & security</h2>
            <Badge tone="positive">V1</Badge>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-text-secondary">
            <li>· No full card numbers, CVV, PIN, or OTP</li>
            <li>· No banking logins or secrets in the frontend</li>
            <li>· URLs are parsed locally — not scraped remotely</li>
            <li>· User text is rendered as text (not HTML)</li>
            <li>· Import rejects PAN-like digit strings</li>
          </ul>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-sm font-semibold">Engine notes</h2>
            <Badge tone="warning">Deterministic</Badge>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Reward math is pure TypeScript. Catalog product names do not include verified rates.
            Synthetic fixtures on Rewards are for testing only.
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
