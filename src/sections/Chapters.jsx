import { useLang } from '../lib/i18n.jsx';
import { Img } from '../lib/Img.jsx';
import { CATEGORIES } from '../content/products.js';
import { inStock } from '../lib/useProducts.js';

const ALT = {
  'poster-savory': 'Spunchy “Savory” poster: golden crumbed rolls on a white plate',
  'poster-fresh': 'Spunchy “Soft, Fluffy & Fresh” poster with filled buns',
  'poster-love': 'Spunchy “Cake is the language of love” poster with a rosette cake',
};

export function Chapters({ products, onPick }) {
  const { t, pick } = useLang();
  return (
    <section className="chapters wrap" data-section="chapters" aria-labelledby="chapters-title">
      <h2 id="chapters-title" className="display display--md">{t('chapters_title')}</h2>
      <ol className="chapters__list">
        {CATEGORIES.map((c, i) => {
          const all = products.filter((p) => p.category === c.id);
          const n = all.filter(inStock).length;
          return (
            <li key={c.id} className={`chapter${c.image ? '' : ' chapter--plain'}`}>
              {c.image && <Img name={c.image} alt={ALT[c.image]} sizes="(min-width: 900px) 30vw, 90vw" className="chapter__img" />}
              <div className="chapter__body">
                <span className="chapter__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="display display--sm">{pick(c, 'name')}</h3>
                {pick(c, 'line') && <p className="chapter__line">{pick(c, 'line')}</p>}
                {all.length ? (
                  <a className="link-arrow" href="#menu" onClick={() => onPick(c.id)}>
                    {t('see_all')} <span className="muted">({n} {t('in_stock').toLowerCase()})</span>
                  </a>
                ) : (
                  <p className="muted">{t('ask_counter')}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
