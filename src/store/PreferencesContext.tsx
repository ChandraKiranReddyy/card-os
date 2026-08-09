import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { UserPreferenceWeights } from '../types/engine'
import { loadPreferences, savePreferences } from './preferencesStorage'

interface PreferencesContextValue {
  weights: UserPreferenceWeights
  setWeights: (w: UserPreferenceWeights) => void
  updateWeight: (key: keyof UserPreferenceWeights, value: number) => void
  reset: () => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [weights, setWeightsState] = useState<UserPreferenceWeights>(
    () => loadPreferences().weights,
  )

  const setWeights = useCallback((w: UserPreferenceWeights) => {
    setWeightsState(w)
    savePreferences(w)
  }, [])

  const updateWeight = useCallback(
    (key: keyof UserPreferenceWeights, value: number) => {
      setWeights({ ...weights, [key]: value })
    },
    [setWeights, weights],
  )

  const reset = useCallback(() => {
    const next = loadPreferences().weights
    // reload defaults by saving defaults
    const defaults: UserPreferenceWeights = {
      travel: 1,
      cashback: 1,
      hotels: 1,
      shopping: 1,
      maximumValue: 1,
    }
    setWeights(defaults)
    void next
  }, [setWeights])

  const value = useMemo(
    () => ({ weights, setWeights, updateWeight, reset }),
    [weights, setWeights, updateWeight, reset],
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
