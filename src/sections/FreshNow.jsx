import { useLang, formatPrice } from '../lib/i18n.jsx';
import { inStock } from '../lib/useProducts.js';
import { Img } from '../lib/Img.jsx';

// Live strip: everything in stock this minute, most recently updated first.
export function FreshNow({ products, flash }) {
  const { t, pick } = useLang();
  const items = products
    .filter(inStock)
    .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
    .slice(0, 12);

  return (
    <section className="fresh" id="fresh" data-section="fresh" aria-labelledby="fresh-title">
      <div className="wrap fresh__head">
        <h2 id="fresh-title" className="display display--md">
          <span className="live-dot" aria-hidden="true" /> {t('fresh_title')}
        </h2>
        <p className="muted-on-dark">{t('fresh_sub')}</p>
      </div>
      <ul className="fresh__track" aria-live="polite">
        {items.map((p) => (
          <li key={p.id} className={`fresh__item${flash.has(p.id) ? ' is-flash' : ''}`}>
            {p.image ? (
              <Img name={p.image} alt="" sizes="160px" className="fresh__img" />
            ) : (
              <span className="fresh__img fresh__img--type" aria-hidden="true">{pick(p, 'name').slice(0, 1)}</span>
            )}
            <span className="fresh__name">{pick(p, 'name')}</span>
            <span className="fresh__meta">
              {formatPrice(p.price) || t('ask_price')}
              {p.stock != null && <> · <strong>{p.stock}</strong> {t('left')}</>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
