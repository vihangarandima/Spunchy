import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import { Header } from './components/Header'
import { CartDrawer } from './components/CartDrawer'
import { SearchDialog } from './components/SearchDialog'
import { Toast, FloatingCart } from './components/Toast'
import { Footer } from './sections/Footer'
import { Home } from './pages/Home'
import { Menu } from './pages/Menu'
import { ProductPage } from './pages/Product'
import { Checkout } from './pages/Checkout'
import { OrderDone, Outlets, About } from './pages/Other'
import { NotFound } from './pages/NotFound'
import { useCart } from './store/cart'
import { routeMeta } from './routes'
import { startSmoothScroll, scrollTop, ScrollTrigger } from './lib/motion'

export function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    startSmoothScroll()
    useCart.persist.rehydrate()
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  // New page: top of the page, its own title, re-measure scroll scenes.
  useEffect(() => {
    if (pathname !== '/') document.getElementById('boot')?.remove()
    scrollTop()
    document.title = routeMeta(pathname).title
    const t = setTimeout(() => ScrollTrigger.refresh(), 100)
    return () => clearTimeout(t)
  }, [pathname])

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:category" element={<Menu />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartRedirect />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderDone />} />
          <Route path="/outlets" element={<Outlets />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <SearchDialog />
      <Toast />
      <FloatingCart />
      <div className="grain-overlay" aria-hidden="true" />
    </>
  )
}

/** /cart opens the drawer over the menu. */
function CartRedirect() {
  const openDrawer = useCart((s) => s.openDrawer)
  useEffect(() => openDrawer(true), [openDrawer])
  return <Menu />
}
