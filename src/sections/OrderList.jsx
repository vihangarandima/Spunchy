import { useEffect, useRef, useState } from 'react';
import { useLang, formatPrice } from '../lib/i18n.jsx';
import { BUSINESS } from '../content/business.js';

// Order list: a floating button + a dialog. Built on <dialog> so focus
// trapping, Esc to close and the backdrop come from the browser.
export function OrderList({ products, order, setQty, clear }) {
  const { t, pick } = useLang();
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  const lines = Object.entries(order)
    .map(([id, qty]) => ({ p: products.find((x) => x.id === id), qty }))
    .filter((l) => l.p && l.qty > 0);
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const total = lines.reduce((a, l) => a + (l.p.price || 0) * l.qty, 0);
  const unknown = lines.some((l) => l.p.price == null);

  const text = [
    'Spunchy order list',
    ...lines.map((l) => `• ${l.qty} × ${l.p.name_en}${l.p.price != null ? ` (${formatPrice(l.p.price)})` : ''}`),
    total ? `Estimated total: ${formatPrice(total)}${unknown ? ' + items to price' : ''}` : '',
  ].filter(Boolean).join('\n');

  useEffect(() => { if (!count) ref.current?.open && ref.current.close(); }, [count]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  return (
    <>
      <button type="button" className={`order-fab${count ? ' is-on' : ''}`} onClick={() => ref.current?.showModal()} aria-haspopup="dialog" hidden={!count}>
        {t('order_list')} <span className="order-fab__count">{count}</span>
      </button>
      <dialog ref={ref} className="sheet" aria-labelledby="order-title" onClick={(e) => e.target === ref.current && ref.current.close()}>
        <div className="sheet__inner">
          <header className="sheet__head">
            <h2 id="order-title" className="display display--sm">{t('order_list')}</h2>
            <button type="button" className="icon-btn" onClick={() => ref.current.close()} aria-label={t('close')}>×</button>
          </header>
          {lines.length === 0 ? (
            <p className="muted">{t('order_empty')}</p>
          ) : (
            <ul className="sheet__lines">
              {lines.map(({ p, qty }) => (
                <li key={p.id}>
                  <span className="sheet__name">{pick(p, 'name')}</span>
                  <span className="qty">
                    <button type="button" className="icon-btn" onClick={() => setQty(p.id, qty - 1)} aria-label={`${t('qty_less')}: ${pick(p, 'name')}`}>−</button>
                    <span aria-live="polite">{qty}</span>
                    <button type="button" className="icon-btn" onClick={() => setQty(p.id, qty + 1)} aria-label={`${t('qty_more')}: ${pick(p, 'name')}`}>+</button>
                  </span>
                  <span className="sheet__price">{p.price != null ? formatPrice(p.price * qty) : t('ask_price')}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="sheet__total"><span>{t('total')}</span> <strong>{formatPrice(total)}</strong></p>
          <p className="muted small">{t('total_note')}</p>
          <div className="sheet__actions">
            {BUSINESS.whatsapp && (
              <a className="btn btn--primary" href={`https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener">{t('send_whatsapp')}</a>
            )}
            <button type="button" className="btn btn--ghost" onClick={copy}>{copied ? t('copied') : t('copy_list')}</button>
            <button type="button" className="btn btn--text" onClick={clear}>{t('clear')}</button>
          </div>
        </div>
      </dialog>
    </>
  );
}
