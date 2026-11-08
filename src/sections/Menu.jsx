import { useDeferredValue, useMemo } from 'react';
import { useLang, formatPrice } from '../lib/i18n.jsx';
import { inStock } from '../lib/useProducts.js';
import { Img } from '../lib/Img.jsx';
import { CATEGORIES } from '../content/products.js';

export function Menu({ products, flash, filter, setFilter, order, addToOrder, mode }) {
  const { t, pick, lang } = useLang();
  const q = useDeferredValue(filter.q.trim().toLowerCase());

  const visible = useMemo(
    () =>
      products.filter((p) => {
        if (filter.cat !== 'all' && p.category !== filter.cat) return false;
        if (filter.avail && !inStock(p)) return false;
        if (q && !`${p.name_en} ${p.name_si || ''}`.toLowerCase().includes(q)) return false;
        return true;
      }),
    [products, filter.cat, filter.avail, q]
  );

  return (
    <section className="menu wrap" id="menu" data-section="menu" aria-labelledby="menu-title">
      <header className="menu__head">
        <h2 id="menu-title" className="display display--md">{t('menu_title')}</h2>
        <p className="muted">{t('menu_sub')}</p>
        {mode === 'mock' && <p className="note">{t('demo_note')}</p>}
      </header>

      <div className="menu__tools">
        <label className="search">
          <span className="sr-only">{t('search')}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.2 4.2-1.4 1.4-4.2-4.2A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" fill="currentColor" /></svg>
          <input type="search" value={filter.q} placeholder={t('search')} onChange={(e) => setFilter({ ...filter, q: e.target.value })} lang={lang === 'si' ? 'si' : 'en'} />
        </label>
        <div className="chips" role="group" aria-label={t('menu_title')}>
          {[{ id: 'all' }, ...CATEGORIES].map((c) => (
            <button key={c.id} type="button" className="chip" aria-pressed={filter.cat === c.id} onClick={() => setFilter({ ...filter, cat: c.id })}>
              {c.id === 'all' ? t('all') : pick(c, 'name')}
            </button>
          ))}
        </div>
        <label className="toggle">
          <input type="checkbox" checked={filter.avail} onChange={(e) => setFilter({ ...filter, avail: e.target.checked })} />
          <span>{t('only_available')}</span>
        </label>
      </div>

      <p className="sr-only" aria-live="polite">{visible.length} {t('items')}</p>
      {visible.length === 0 ? (
        <p className="empty">{t('no_results')}</p>
      ) : (
        <ul className="grid">
          {visible.map((p) => {
            const ok = inStock(p);
            const inOrder = order[p.id] || 0;
            return (
              <li key={p.id} className={`card${ok ? '' : ' is-out'}${flash.has(p.id) ? ' is-flash' : ''}`}>
                <div className="card__media">
                  {p.image ? (
                    <Img name={p.image} alt={pick(p, 'name')} sizes="(min-width: 1200px) 280px, (min-width: 700px) 30vw, 50vw" />
                  ) : (
                    <span className="card__type" aria-hidden="true">{pick(p, 'name').slice(0, 1)}</span>
                  )}
                  <span className={`badge${ok ? '' : ' badge--out'}`}>{ok ? (p.stock != null ? `${p.stock} ${t('left')}` : t('in_stock')) : t('sold_out')}</span>
                </div>
                <div className="card__body">
                  <h3 className="card__name">{pick(p, 'name')}</h3>
                  {pick(p, 'description') && <p className="card__desc">{pick(p, 'description')}</p>}
                  <div className="card__row">
                    <span className="price">{formatPrice(p.price) || <span className="muted">{t('ask_price')}</span>}</span>
                    <button
                      type="button"
                      className="btn btn--small"
                      disabled={!ok}
                      onClick={() => addToOrder(p.id)}
                      aria-label={`${t('add_to_order')}: ${pick(p, 'name')}`}
                    >
                      {t('add')}{inOrder ? ` · ${inOrder}` : ''}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
