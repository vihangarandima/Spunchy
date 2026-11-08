import { useEffect, useRef } from 'react';
import { useLang } from '../lib/i18n.jsx';
import { Img } from '../lib/Img.jsx';
import { prefersReducedMotion } from '../lib/device.js';

const PHOTOS = [
  { name: 'shopfront', alt: 'The Spunchy shopfront: red signboard with the Spunchy script logo above a glass entrance' },
  { name: 'counter', alt: 'Glass display counter of slices and bread baskets against warm wood panelling' },
  { name: 'cake-cabinet', alt: 'Tall cake cabinet of decorated cakes, topped with orange Spunchy cake boxes' },
  { name: 'interior', alt: 'The café floor: cabinets, bread baskets and seating by the street windows' },
  { name: 'savory-shelf', alt: 'Wooden shelf of packed bakes beneath the “Savory” poster' },
  { name: 'poster-heaven', alt: 'Spunchy poster reading “A slice of heaven in every bite” with a row of cake slices' },
];

// Immersive gallery: a swipeable scroll-snap track. Each photo drifts
// slightly against the scroll (transform only) while the section is on screen.
export function Space() {
  const { t } = useLang();
  const track = useRef(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0, on = false;
    const imgs = [...el.querySelectorAll('img')];
    const update = () => {
      raf = 0;
      const mid = innerWidth / 2;
      for (const img of imgs) {
        const r = img.parentElement.getBoundingClientRect();
        const d = (r.left + r.width / 2 - mid) / innerWidth;
        img.style.transform = `translate3d(${(-d * 8).toFixed(2)}%,0,0) scale(1.12)`;
      }
    };
    const req = () => { if (on && !raf) raf = requestAnimationFrame(update); };
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; req(); });
    io.observe(el);
    el.addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    return () => { io.disconnect(); el.removeEventListener('scroll', req); removeEventListener('resize', req); cancelAnimationFrame(raf); };
  }, []);

  const step = (dir) => {
    const el = track.current;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <section className="space" id="space" data-section="space" aria-labelledby="space-title">
      <div className="wrap space__head">
        <div>
          <h2 id="space-title" className="display display--md">{t('space_title')}</h2>
          <p className="muted-on-dark">{t('space_sub')}</p>
        </div>
        <div className="space__nav">
          <button type="button" className="icon-btn icon-btn--dark" onClick={() => step(-1)} aria-label={t('prev')}>←</button>
          <button type="button" className="icon-btn icon-btn--dark" onClick={() => step(1)} aria-label={t('next')}>→</button>
        </div>
      </div>
      <ul className="space__track" ref={track} tabIndex={0} aria-label={t('space_title')}>
        {PHOTOS.map((p) => (
          <li key={p.name} className="space__slide">
            <Img name={p.name} alt={p.alt} sizes="(min-width: 900px) 40vw, 82vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
