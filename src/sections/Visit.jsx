import { useLang } from '../lib/i18n.jsx';
import { BUSINESS } from '../content/business.js';

export function Visit() {
  const { t } = useLang();
  const b = BUSINESS;
  const services = [
    b.services.dineIn && t('dine_in'),
    b.services.takeaway && t('takeaway'),
    b.services.delivery && t('delivery'),
  ].filter(Boolean);

  return (
    <section className="visit wrap" id="visit" data-section="visit" aria-labelledby="visit-title">
      <h2 id="visit-title" className="display display--md">{t('visit_title')}</h2>
      <div className="visit__grid">
        <div className="visit__card">
          <h3 className="label">{t('address')}</h3>
          <address>
            {b.name} {b.descriptor}<br />
            {b.streetAddress && <>{b.streetAddress}<br /></>}
            {b.locality}, Sri Lanka
          </address>
          <a className="btn btn--primary" href={b.mapsUrl} target="_blank" rel="noopener">{t('open_maps')}</a>
        </div>
        {(b.phone || b.whatsapp) && (
          <div className="visit__card">
            {b.phone && <a className="btn btn--ghost" href={`tel:${b.phone}`}>{t('call')}</a>}
            {b.whatsapp && <a className="btn btn--ghost" href={`https://wa.me/${b.whatsapp}`} target="_blank" rel="noopener">{t('whatsapp')}</a>}
          </div>
        )}
        {services.length > 0 && (
          <div className="visit__card">
            <h3 className="label">{t('how')}</h3>
            <ul className="pills">{services.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        )}
        {b.hours && (
          <div className="visit__card">
            <h3 className="label">{t('hours')}</h3>
            <dl className="hours">
              {b.hours.map((h) => (<div key={h.days}><dt>{h.days}</dt><dd>{h.open}–{h.close}</dd></div>))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useLang();
  const s = BUSINESS.socials;
  return (
    <footer className="footer" data-section="footer">
      <div className="wrap footer__inner">
        <img src="/img/logo-sign.webp" width="600" height="223" alt="Spunchy" className="footer__logo" loading="lazy" />
        <p className="footer__line display display--sm"><em>Cake is the language of love.</em></p>
        <nav aria-label={t('follow')}>
          <ul className="footer__social">
            {s.facebook && <li><a href={s.facebook} target="_blank" rel="noopener">Facebook · Spunchylk</a></li>}
            {s.instagram && <li><a href={s.instagram} target="_blank" rel="noopener">Instagram</a></li>}
            {s.tiktok && <li><a href={s.tiktok} target="_blank" rel="noopener">TikTok</a></li>}
          </ul>
        </nav>
        <p className="footer__small">© {new Date().getFullYear()} Spunchy · {BUSINESS.locality}</p>
      </div>
    </footer>
  );
}
