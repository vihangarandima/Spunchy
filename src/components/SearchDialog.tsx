// Full-width search over every product, keyboard first (↑ ↓ Enter, Esc).
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { ProductArt } from './ProductArt'
import { products, fromPrice, formatPrice } from '../content/products'
import { categoryBySlug } from '../content/categories'
import { useUi } from '../store/ui'
import { getLenis } from '../lib/motion'
import { trapFocus } from './CartDrawer'

export function SearchDialog() {
  const open = useUi((s) => s.searchOpen)
  const setOpen = useUi((s) => s.setSearchOpen)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return products.slice(0, 6)
    return products.filter((p) => `${p.name} ${categoryBySlug(p.category)?.name} ${p.description ?? ''}`.toLowerCase().includes(t))
  }, [q])

  useEffect(() => setActive(0), [q])
  useEffect(() => {
    if (!open) {
      getLenis()?.start()
      return
    }
    getLenis()?.stop()
    setQ('')
    requestAnimationFrame(() => input.current?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'Tab' && box.current) trapFocus(e, box.current)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  const go = (slug: string) => {
    setOpen(false)
    navigate(`/product/${slug}`)
  }

  if (!open) return null
  return (
    <>
      <div className="scrim is-open" onClick={() => setOpen(false)} aria-hidden="true" />
      <div ref={box} className="fixed inset-x-0 top-0 z-[100] mx-auto mt-4 w-[min(44rem,calc(100%-2rem))] rounded-cabinet bg-paper p-4 text-ink shadow-lift" role="dialog" aria-modal="true" aria-label="Search the menu" data-lenis-prevent>
        <label htmlFor="search-input" className="sr-only">
          Search cakes, slices, savory and bread
        </label>
        <input
          ref={input}
          id="search-input"
          className="field text-lg"
          placeholder="Search cakes, slices, savory…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          aria-activedescendant={results[active] ? `sr-${results[active].id}` : undefined}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(results.length - 1, a + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(0, a - 1))
            } else if (e.key === 'Enter' && results[active]) go(results[active].slug)
          }}
        />
        <ul id="search-results" role="listbox" className="mt-3 max-h-[60vh] overflow-y-auto">
          {results.length === 0 && <li className="p-4 text-ink/70">Nothing called “{q}” yet. Try “cake” or “bun”.</li>}
          {results.map((p, i) => (
            <li
              key={p.id}
              id={`sr-${p.id}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(p.slug)}
              className={`flex cursor-pointer items-center gap-4 rounded-chip p-2 ${i === active ? 'bg-ink/8' : ''}`}
            >
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full [container-type:inline-size]" style={{ background: categoryBySlug(p.category)?.disc }}>
                <ProductArt product={p} sizes="56px" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display font-bold">{p.name}</span>
                <span className="block text-micro text-ink/60">{categoryBySlug(p.category)?.name}</span>
              </span>
              <span className="font-display text-small font-bold">{formatPrice(fromPrice(p))}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
