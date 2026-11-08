import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { LangProvider, useLang } from './lib/i18n.jsx';
import { useProducts } from './lib/useProducts.js';
import { Hero } from './sections/Hero.jsx';
import { FreshNow } from './sections/FreshNow.jsx';
import { Chapters } from './sections/Chapters.jsx';
import { Menu } from './sections/Menu.jsx';
import { OrderList } from './sections/OrderList.jsx';
import { Space } from './sections/Space.jsx';
import { Visit, Footer } from './sections/Visit.jsx';

const Admin = lazy(() => import('./admin/Admin.jsx'));

function Header() {
  const { t, toggle, lang } = useLang();
  return (
    <header className="topbar">
      <a className="skip" href="#menu">{t('skip')}</a>
      <div className="wrap topbar__inner">
        <a href="#top" className="topbar__brand" aria-label="Spunchy — top of page">
          <img src="/favicon.png" width="32" height="32" alt="" /> <span>Spunchy</span>
        </a>
        <nav aria-label="Sections">
          <ul className="topbar__nav">
            <li><a href="#fresh">{t('nav_fresh')}</a></li>
            <li><a href="#menu">{t('nav_menu')}</a></li>
            <li><a href="#space">{t('nav_space')}</a></li>
            <li><a href="#visit">{t('nav_visit')}</a></li>
          </ul>
        </nav>
        <button type="button" className="chip chip--lang" onClick={toggle} title={t('lang_label')} lang={lang === 'en' ? 'si' : 'en'}>
          {t('lang_switch')}
        </button>
      </div>
    </header>
  );
}

function usePersistentOrder() {
  const [order, setOrder] = useState({});
  const loaded = useRef(false);
  useEffect(() => {
    try { setOrder(JSON.parse(localStorage.getItem('spunchy:order') || '{}')); } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => { if (loaded.current) try { localStorage.setItem('spunchy:order', JSON.stringify(order)); } catch {} }, [order]);
  const setQty = useCallback((id, qty) => setOrder((o) => {
    const n = { ...o };
    if (qty > 0) n[id] = qty; else delete n[id];
    return n;
  }), []);
  const add = useCallback((id) => setOrder((o) => ({ ...o, [id]: (o[id] || 0) + 1 })), []);
  return { order, setQty, add, clear: () => setOrder({}) };
}

function PublicSite() {
  const { products, flash, mode } = useProducts();
  const { order, setQty, add, clear } = usePersistentOrder();
  const [filter, setFilter] = useState({ q: '', cat: 'all', avail: false });
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <FreshNow products={products} flash={flash} />
        <Chapters products={products} onPick={(cat) => setFilter((f) => ({ ...f, cat }))} />
        <Menu products={products} flash={flash} filter={filter} setFilter={setFilter} order={order} addToOrder={add} mode={mode} />
        <Space />
        <Visit />
      </main>
      <Footer />
      <OrderList products={products} order={order} setQty={setQty} clear={clear} />
    </>
  );
}

export const isAdminPath = (path) => path.replace(/\/$/, '') === '/admin';

export default function App({ path = typeof location !== 'undefined' ? location.pathname : '/' }) {
  const isAdmin = isAdminPath(path);
  return (
    <LangProvider>
      {isAdmin ? (
        <Suspense fallback={<p className="wrap" style={{ padding: '2rem 0' }}>Loading…</p>}>
          <Admin />
        </Suspense>
      ) : (
        <PublicSite />
      )}
    </LangProvider>
  );
}
