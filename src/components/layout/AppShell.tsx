import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { CommandPalette } from '../command/CommandPalette'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export function AppShell() {
  const [commandOpen, setCommandOpen] = useState(false)
  const location = useLocation()
  const reduced = useReducedMotion()

  return (
    <div className="mesh-bg flex h-full min-h-0">
      <a
        href="#main-content"
        className="fixed top-0 left-0 z-[100] -translate-y-full rounded-br-lg bg-accent px-3 py-2 text-sm font-semibold text-void transition focus:translate-y-0"
      >
        Skip to main content
      </a>

      <Sidebar onOpenCommand={() => setCommandOpen(true)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent-dim font-display text-[10px] font-bold text-accent-soft"
              aria-hidden
            >
              C//
            </div>
            <span className="font-display text-sm font-semibold tracking-wide">
              CARD//OS
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="rounded-lg border border-border-soft bg-surface-1 px-2.5 py-1.5 text-[10px] font-semibold text-text-muted"
            aria-label="Open command palette"
          >
            ⌘K
          </button>
        </header>

        <main
          id="main-content"
          className="scroll-thin flex-1 overflow-y-auto pb-24 lg:pb-6"
          tabIndex={-1}
        >
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -6 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
                }
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <MobileNav />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
