/**
 * GitHub Pages serves 404.html for unknown paths.
 * Copy index.html → 404.html so client-side routes work.
 */
import { copyFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const index = join(root, 'dist/index.html')
const notFound = join(root, 'dist/404.html')

if (existsSync(index)) {
  copyFileSync(index, notFound)
  console.log('SPA: copied dist/index.html → dist/404.html')
} else {
  console.warn('SPA: dist/index.html not found — skip 404 copy')
}
