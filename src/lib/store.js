// Data layer with one interface and two back-ends:
//
//   supabase  — when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set.
//               Reads are public; writes need a signed-in staff member (RLS).
//               Changes arrive over Supabase Realtime (postgres_changes).
//   mock      — no keys. Data lives in localStorage and changes are broadcast
//               to every open tab with BroadcastChannel, so the
//               "edit in admin, watch the public page update" flow works
//               locally across two windows.
//
// Interface: { mode, list(), subscribe(fn), update(id, patch), auth }

import { SEED_PRODUCTS } from '../content/products.js';

const URL_ = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const MODE = URL_ && KEY ? 'supabase' : 'mock';

let storePromise;
export function getStore() {
  if (!storePromise) storePromise = MODE === 'supabase' ? supabaseStore() : Promise.resolve(mockStore());
  return storePromise;
}

/* ---------------- mock ---------------- */

const LS_KEY = 'spunchy:products:v1';

function mockStore() {
  const read = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return SEED_PRODUCTS.map((p) => ({ ...p }));
  };
  const write = (rows) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(rows)); } catch {}
  };
  const listeners = new Set();
  const bc = 'BroadcastChannel' in self ? new BroadcastChannel('spunchy-products') : null;
  const emit = (row) => listeners.forEach((fn) => fn(row));
  bc?.addEventListener('message', (e) => emit(e.data));

  return {
    mode: 'mock',
    async list() { return read(); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    async update(id, patch) {
      const rows = read();
      const i = rows.findIndex((r) => r.id === id);
      if (i < 0) throw new Error('Not found');
      rows[i] = { ...rows[i], ...patch, updated_at: new Date().toISOString() };
      write(rows);
      emit(rows[i]);
      bc?.postMessage(rows[i]);
      return rows[i];
    },
    async reset() {
      localStorage.removeItem(LS_KEY);
      for (const r of read()) { emit(r); bc?.postMessage(r); }
    },
    auth: {
      async session() { return { user: { email: 'demo mode' } }; },
      async signIn() { return { ok: true }; },
      async signOut() {},
      onChange() { return () => {}; },
    },
  };
}

/* ---------------- supabase ---------------- */

async function supabaseStore() {
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(URL_, KEY, { realtime: { params: { eventsPerSecond: 10 } } });
  const listeners = new Set();
  sb.channel('public:products')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
      if (payload.new && payload.new.id) listeners.forEach((fn) => fn(payload.new));
    })
    .subscribe();

  return {
    mode: 'supabase',
    async list() {
      const { data, error } = await sb.from('products').select('*').order('sort', { ascending: true });
      if (error) throw error;
      return data;
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    async update(id, patch) {
      const { data, error } = await sb.from('products').update(patch).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    auth: {
      async session() { return (await sb.auth.getSession()).data.session; },
      async signIn(email) {
        const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/admin`, shouldCreateUser: false } });
        if (error) throw error;
        return { ok: true };
      },
      async signOut() { await sb.auth.signOut(); },
      onChange(fn) {
        const { data } = sb.auth.onAuthStateChange((_e, s) => fn(s));
        return () => data.subscription.unsubscribe();
      },
    },
  };
}
