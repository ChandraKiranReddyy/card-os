import type { UserPreferenceWeights } from '../types/engine'
import { DEFAULT_PREFERENCE_WEIGHTS } from '../core/valuationEngine'

const KEY = 'cardos.preferences.v1'

export interface PreferencesSnapshot {
  version: 1
  weights: UserPreferenceWeights
  updatedAt: string
}

export function loadPreferences(): PreferencesSnapshot {
  if (typeof localStorage === 'undefined') {
    return {
      version: 1,
      weights: { ...DEFAULT_PREFERENCE_WEIGHTS },
      updatedAt: new Date().toISOString(),
    }
  }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      return {
        version: 1,
        weights: { ...DEFAULT_PREFERENCE_WEIGHTS },
        updatedAt: new Date().toISOString(),
      }
    }
    const data = JSON.parse(raw) as PreferencesSnapshot
    return {
      version: 1,
      weights: { ...DEFAULT_PREFERENCE_WEIGHTS, ...data.weights },
      updatedAt: data.updatedAt || new Date().toISOString(),
    }
  } catch {
    return {
      version: 1,
      weights: { ...DEFAULT_PREFERENCE_WEIGHTS },
      updatedAt: new Date().toISOString(),
    }
  }
}

export function savePreferences(weights: UserPreferenceWeights): PreferencesSnapshot {
  const snap: PreferencesSnapshot = {
    version: 1,
    weights,
    updatedAt: new Date().toISOString(),
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(snap))
  }
  return snap
}
