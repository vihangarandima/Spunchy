// All products grouped under category headings, with sticky chips that scroll-spy.
// Used on the home page (full menu preview) and on /menu.
import { useEffect, useRef, useState } from 'react'
import { ProductCard } from '../components/ProductCard'
import { liveCategories, productsIn } from '../content/products'
import { gsap, ease, scrollToTarget } from '../lib/motion'
import { useGsap } from '../hooks/useGsap'

export function MenuByCategory({ idPrefix = 'home', navBg = 'bg-icing/95' }: { idPrefix?: string; navBg?: string }) {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string>(liveCategories[0].slug)

  useEffect(() => {
    const els = liveCategories.map((c) => document.getElementById(`${idPrefix}-${c.slug}`)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActive(vis[0].target.id.replace(`${idPrefix}-`, ''))
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [idPrefix])

  useGsap(root, () => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('.menu-group').forEach((g) => {
        gsap.from(g.querySelectorAll('.product-card'), { y: 40, autoAlpha: 0, stagger: 0.05, duration: 0.7, ease: ease.swash, scrollTrigger: { trigger: g, start: 'top 80%' } })
      })
    })
  })

  return (
    <div ref={root}>
      <nav aria-label="Menu categories" className={`sticky top-(--header-h) z-20 mt-8 py-3 backdrop-blur-md ${navBg}`}>
        <ul className="no-scrollbar flex gap-2 overflow-x-auto px-(--space-gutter)" data-lenis-prevent-horizontal>
          {liveCategories.map((c) => (
            <li key={c.slug} className="shrink-0">
              <a
                href={`#${idPrefix}-${c.slug}`}
                className="chip bg-paper"
                aria-current={active === c.slug ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToTarget(`#${idPrefix}-${c.slug}`)
                }}
              >
                {c.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {liveCategories.map((c) => (
        <section key={c.slug} id={`${idPrefix}-${c.slug}`} aria-labelledby={`${idPrefix}-${c.slug}-h`} className="menu-group scroll-mt-40 px-(--space-gutter) pt-14">
          <div className="flex items-baseline gap-4 border-b border-ink/10 pb-3">
            <h3 id={`${idPrefix}-${c.slug}-h`} className="punch text-h1 uppercase">
              {c.name}
            </h3>
            <p className="lede hidden text-ink/60 sm:block">{c.short}</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {productsIn(c.slug).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
