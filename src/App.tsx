import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Cursor } from './components/Cursor'
import { Intro } from './sections/Intro'
import { Hero } from './sections/Hero'
import { Posters } from './sections/Posters'
import { Cabinet } from './sections/Cabinet'
import { WalkIn } from './sections/WalkIn'
import { FindUs } from './sections/FindUs'
import { Instagram } from './sections/Instagram'
import { Footer } from './sections/Footer'
import { startSmoothScroll, ScrollTrigger } from './lib/motion'

export function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    startSmoothScroll()
    // Pinned scenes measure layout; re-measure once fonts and images settle.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
  }, [])

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Intro onDone={() => setReady(true)} />
      <Header />
      <main id="main">
        <Hero ready={ready} />
        <Posters />
        <Cabinet />
        <WalkIn />
        <FindUs />
        <Instagram />
      </main>
      <Footer />
      <Cursor />
      <div className="grain-overlay" aria-hidden="true" />
    </>
  )
}
