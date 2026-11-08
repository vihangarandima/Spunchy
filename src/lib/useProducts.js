import { useEffect, useRef, useState } from 'react';
import { getStore } from './store.js';
import { SEED_PRODUCTS } from '../content/products.js';

// Live product list. Starts from the seed so the first paint has content,
// then swaps to the store's data and applies realtime changes as they arrive.
// `flash` holds ids changed in the last ~2s (for a brief highlight).
export function useProducts() {
  const [rows, setRows] = useState(SEED_PRODUCTS);
  const [flash, setFlash] = useState(() => new Set());
  const [mode, setMode] = useState(null);
  const timers = useRef(new Map());

  useEffect(() => {
    let off = () => {};
    let alive = true;
    getStore().then(async (store) => {
      if (!alive) return;
      setMode(store.mode);
      try { setRows(await store.list()); } catch (e) { console.error(e); }
      off = store.subscribe((row) => {
        setRows((prev) => {
          const i = prev.findIndex((r) => r.id === row.id);
          if (i < 0) return [...prev, row];
          const next = prev.slice();
          next[i] = { ...prev[i], ...row };
          return next;
        });
        setFlash((s) => new Set(s).add(row.id));
        clearTimeout(timers.current.get(row.id));
        timers.current.set(row.id, setTimeout(() => setFlash((s) => { const n = new Set(s); n.delete(row.id); return n; }), 2200));
      });
    });
    return () => { alive = false; off(); };
  }, []);

  return { products: rows, flash, mode };
}

export const inStock = (p) => p.is_available && (p.stock == null || p.stock > 0);
