import { useEffect, useRef, useState } from 'react';
import { useLang } from '../lib/i18n.jsx';
import { Img } from '../lib/Img.jsx';
import { qualityTier, hasWebGL } from '../lib/device.js';

// First paint is plain HTML/CSS: real logo, real cake photo, the client's own
// tagline. The 3D sprinkles chunk is requested only after the page has loaded,
// on the visitor's first interaction (or after 6 s idle), and only if the
// device qualifies — so it never competes with first paint or first input.
export function Hero() {
  const { t } = useLang();
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  // Device checks run after hydration (prerendered HTML has no canvas).
  const [tier, setTier] = useState('off');
  const [on, setOn] = useState(true);
  useEffect(() => {
    setTier(qualityTier());
    try { if (localStorage.getItem('spunchy:3d') === 'off') setOn(false); } catch {}
  }, []);
  const [live, setLive] = useState(false);
  const [canTilt, setCanTilt] = useState(false);

  useEffect(() => {
    if (tier === 'off' || !on) return;
    let cancelled = false;
    let started = false;
    const start = () => {
      if (started || cancelled) return;
      started = true;
      disarm();
      if (!hasWebGL()) return;
      import('../three/sprinkles.js').then(({ mountSprinkles }) => {
        if (cancelled || !canvasRef.current) return;
        sceneRef.current = mountSprinkles(canvasRef.current, {
          tier,
          onFallback: () => { setLive(false); sceneRef.current = null; },
        });
        setLive(true);
        setCanTilt(matchMedia('(pointer: coarse)').matches && 'DeviceOrientationEvent' in window);
      });
    };
    const EVENTS = ['pointermove', 'pointerdown', 'touchstart', 'scroll', 'keydown'];
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    let timer = 0;
    const arm = () => {
      EVENTS.forEach((e) => addEventListener(e, start, { once: true, passive: true }));
      timer = setTimeout(() => idle(start, { timeout: 2000 }), 6000);
    };
    function disarm() {
      EVENTS.forEach((e) => removeEventListener(e, start));
      clearTimeout(timer);
    }
    if (document.readyState === 'complete') arm();
    else addEventListener('load', arm, { once: true });
    return () => {
      cancelled = true;
      removeEventListener('load', arm);
      disarm();
      sceneRef.current?.dispose();
      sceneRef.current = null;
      setLive(false);
    };
  }, [tier, on]);

  const toggle = () => {
    setOn((v) => {
      try { localStorage.setItem('spunchy:3d', v ? 'off' : 'on'); } catch {}
      return !v;
    });
  };

  return (
    <section className="hero" data-section="hero" aria-labelledby="hero-title">
      <div className="hero__photo">
        <Img name="hero-cake" priority sizes="(min-width: 900px) 46vw, 100vw" alt="A round Spunchy cake piped with pink, cream and purple rosettes in the display cabinet" />
      </div>
      {tier !== 'off' && on && <canvas ref={canvasRef} className={`hero__canvas${live ? ' is-live' : ''}`} aria-hidden="true" />}
      <div className="hero__copy">
        <img className="hero__logo" src="/img/logo-sign.webp" width="600" height="223" alt="Spunchy" />
        <p className="kicker">{t('hero_kicker')}</p>
        <h1 id="hero-title" className="display">{t('hero_title')}</h1>
        <p className="lede">{t('hero_sub')}</p>
        <div className="hero__ctas">
          <a className="btn btn--primary" href="#menu">{t('hero_cta_menu')}</a>
          <a className="btn btn--ghost" href="#visit">{t('hero_cta_visit')}</a>
        </div>
        {tier !== 'off' && (
          <div className="hero__motion">
            <button type="button" className="chip" onClick={toggle}>
              {on ? t('motion_on') : t('motion_off')}
            </button>
            {live && canTilt && (
              <button type="button" className="chip" onClick={async () => { if (await sceneRef.current?.enableTilt()) setCanTilt(false); }}>
                {t('tilt')}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
