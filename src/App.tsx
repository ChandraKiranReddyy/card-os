import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'
import { WalletProvider } from './store/WalletContext'
import { PreferencesProvider } from './store/PreferencesContext'
import { TransactionProvider } from './store/TransactionContext'
import { OptimizationProvider } from './store/OptimizationContext'
import { Skeleton } from './components/ui/Skeleton'

// Eager: primary shell destinations
import { DashboardPage } from './features/dashboard/DashboardPage'
import { AnalyzerPage } from './features/analyzer/AnalyzerPage'
import { WalletPage } from './features/wallet/WalletPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { MorePage } from './features/more/MorePage'

// Lazy: chart-heavy / secondary routes (smaller initial bundle)
const TransactionsPage = lazy(() =>
  import('./features/transactions/TransactionsPage').then((m) => ({
    default: m.TransactionsPage,
  })),
)
const RewardsPage = lazy(() =>
  import('./features/rewards/RewardsPage').then((m) => ({
    default: m.RewardsPage,
  })),
)
const AnalyticsPage = lazy(() =>
  import('./features/analytics/AnalyticsPage').then((m) => ({
    default: m.AnalyticsPage,
  })),
)
const BenefitsPage = lazy(() =>
  import('./features/benefits/BenefitsPage').then((m) => ({
    default: m.BenefitsPage,
  })),
)

function RouteFallback() {
  return (
    <div className="space-y-4 p-1" aria-busy="true" aria-label="Loading page">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

/** Supports GitHub Pages subpath (/card-os/) and root deploys (Vercel/Cloudflare). */
const routerBasename =
  import.meta.env.BASE_URL === '/'
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <PreferencesProvider>
          <TransactionProvider>
            <OptimizationProvider>
              <BrowserRouter basename={routerBasename}>
                <Routes>
                  <Route element={<AppShell />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="wallet" element={<WalletPage />} />
                    <Route path="analyze" element={<AnalyzerPage />} />
                    <Route
                      path="transactions"
                      element={
                        <Suspense fallback={<RouteFallback />}>
                          <TransactionsPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="rewards"
                      element={
                        <Suspense fallback={<RouteFallback />}>
                          <RewardsPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="analytics"
                      element={
                        <Suspense fallback={<RouteFallback />}>
                          <AnalyticsPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="benefits"
                      element={
                        <Suspense fallback={<RouteFallback />}>
                          <BenefitsPage />
                        </Suspense>
                      }
                    />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="more" element={<MorePage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </OptimizationProvider>
          </TransactionProvider>
        </PreferencesProvider>
      </WalletProvider>
    </ErrorBoundary>
  )
}
