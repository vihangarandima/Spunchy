import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STRINGS } from '../content/strings.js';

const LangCtx = createContext(null);
const REVIEW = typeof location !== 'undefined' && new URLSearchParams(location.search).has('review');

function initialLang() {
  try {
    const saved = localStorage.getItem('spunchy:lang');
    if (saved === 'en' || saved === 'si') return saved;
  } catch {}
  return typeof navigator !== 'undefined' && /^si\b/i.test(navigator.language) ? 'si' : 'en';
}

export function LangProvider({ children }) {
  // Start in English so prerendered HTML and first client render match;
  // the saved / browser language is applied right after hydration.
  const [lang, setLang] = useState('en');
  useEffect(() => { const l = initialLang(); if (l !== 'en') setLang(l); }, []);
  useEffect(() => {
    document.documentElement.lang = lang === 'si' ? 'si-LK' : 'en';
    try { localStorage.setItem('spunchy:lang', lang); } catch {}
  }, [lang]);
  const value = useMemo(() => {
    // t('key') -> string in the current language, falling back to English.
    const t = (key) => {
      const s = STRINGS[key];
      if (!s) return key;
      return (lang === 'si' && s.si) || s.en;
    };
    // pick(obj, 'name') -> obj.name_si || obj.name_en
    const pick = (obj, field) => (lang === 'si' && obj[`${field}_si`]) || obj[`${field}_en`];
    return { lang, setLang, t, pick, toggle: () => setLang((l) => (l === 'en' ? 'si' : 'en')) };
  }, [lang]);
  return (
    <LangCtx.Provider value={value}>
      <div className={REVIEW && lang === 'si' ? 'review-si' : undefined}>{children}</div>
    </LangCtx.Provider>
  );
}

export const useLang = () => useContext(LangCtx);

const lkr = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 });
export const formatPrice = (n) => (n == null ? null : `Rs. ${lkr.format(n)}`);
