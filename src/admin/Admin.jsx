import { useEffect, useMemo, useState } from 'react';
import { getStore, MODE } from '../lib/store.js';
import { useProducts } from '../lib/useProducts.js';
import { CATEGORIES } from '../content/products.js';
import { formatPrice } from '../lib/i18n.jsx';

// Staff page at /admin. Written for bakery staff on a phone at the counter:
// big buttons, one item per row, every change saves straight away.
// See ADMIN_GUIDE.md for the plain-language guide.
export default function Admin() {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    document.title = 'Spunchy — staff';
    let off = () => {};
    getStore().then(async (s) => {
      setSession(await s.auth.session());
      off = s.auth.onChange(setSession);
    });
    return () => off();
  }, []);
  if (session === undefined) return <p className="wrap admin-pad">Loading…</p>;
  if (!session) return <SignIn />;
  return <Editor email={session.user?.email} />;
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setState('sending'); setErr('');
    try { await (await getStore()).auth.signIn(email.trim()); setState('sent'); }
    catch (x) { setErr(x.message || 'Could not send the link.'); setState('idle'); }
  };
  return (
    <main className="admin wrap admin-pad">
      <h1 className="display display--md">Staff sign-in</h1>
      {state === 'sent' ? (
        <p className="admin__ok" role="status">Check your email and tap the sign-in link. You can close this page.</p>
      ) : (
        <form onSubmit={submit} className="admin__signin">
          <label htmlFor="email">Your staff email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn btn--primary" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Email me a sign-in link'}</button>
          {err && <p className="admin__err" role="alert">{err}</p>}
        </form>
      )}
    </main>
  );
}

function Editor({ email }) {
  const { products, flash } = useProducts();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState({});
  const list = useMemo(() => products.filter((p) => !q || p.name_en.toLowerCase().includes(q.toLowerCase())), [products, q]);

  const save = async (id, patch) => {
    setStatus((s) => ({ ...s, [id]: 'saving' }));
    try {
      await (await getStore()).update(id, patch);
      setStatus((s) => ({ ...s, [id]: 'saved' }));
      setTimeout(() => setStatus((s) => (s[id] === 'saved' ? { ...s, [id]: undefined } : s)), 1500);
    } catch (e) {
      setStatus((s) => ({ ...s, [id]: `error: ${e.message}` }));
    }
  };

  return (
    <main className="admin wrap admin-pad">
      <header className="admin__head">
        <h1 className="display display--md">Today’s counter</h1>
        <p className="muted small">
          {MODE === 'mock'
            ? 'Demo mode: changes are saved in this browser only and show up in your other open tabs. Connect Supabase to go live.'
            : <>Signed in as {email}. <button type="button" className="btn btn--text" onClick={async () => (await getStore()).auth.signOut()}>Sign out</button></>}
        </p>
        <label className="search">
          <span className="sr-only">Find an item</span>
          <input type="search" placeholder="Find an item…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </header>

      {CATEGORIES.map((c) => {
        const rows = list.filter((p) => p.category === c.id);
        if (!rows.length) return null;
        return (
          <section key={c.id} className="admin__group" aria-labelledby={`g-${c.id}`}>
            <h2 id={`g-${c.id}`} className="label">{c.name_en}</h2>
            <ul className="admin__list">
              {rows.map((p) => (
                <Row key={p.id} p={p} onSave={save} status={status[p.id]} flash={flash.has(p.id)} />
              ))}
            </ul>
          </section>
        );
      })}
      {MODE === 'mock' && (
        <p><button type="button" className="btn btn--text" onClick={async () => (await getStore()).reset()}>Reset demo data</button></p>
      )}
    </main>
  );
}

function Row({ p, onSave, status, flash }) {
  const [price, setPrice] = useState(p.price ?? '');
  useEffect(() => setPrice(p.price ?? ''), [p.price]);
  const soldOut = !p.is_available || p.stock === 0;
  const commitPrice = () => {
    const n = price === '' ? null : Math.round(Number(price));
    if (Number.isNaN(n) || (n != null && n < 0)) { setPrice(p.price ?? ''); return; }
    if (n !== p.price) onSave(p.id, { price: n });
  };
  const id = `price-${p.id}`;
  return (
    <li className={`admin__row${soldOut ? ' is-out' : ''}${flash ? ' is-flash' : ''}`}>
      <div className="admin__name">
        <strong>{p.name_en}</strong>
        <span className="small muted" role="status">
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : status?.startsWith('error') ? <span className="admin__err">{status}</span> : soldOut ? 'Sold out' : `${formatPrice(p.price) || 'No price'}`}
        </span>
      </div>
      <div className="admin__field">
        <label htmlFor={id} className="small">Price (Rs.)</label>
        <input id={id} inputMode="numeric" pattern="[0-9]*" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))} onBlur={commitPrice} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
      </div>
      <div className="admin__field">
        <span className="small" id={`stock-${p.id}`}>Stock</span>
        <div className="qty" role="group" aria-labelledby={`stock-${p.id}`}>
          <button type="button" className="icon-btn" aria-label={`One less ${p.name_en}`} onClick={() => onSave(p.id, { stock: Math.max(0, (p.stock || 0) - 1) })}>−</button>
          <span className="admin__stock">{p.stock ?? '—'}</span>
          <button type="button" className="icon-btn" aria-label={`One more ${p.name_en}`} onClick={() => onSave(p.id, { stock: (p.stock || 0) + 1, is_available: true })}>+</button>
        </div>
      </div>
      <button type="button" className={`btn ${soldOut ? 'btn--primary' : 'btn--ghost'} admin__toggle`} onClick={() => onSave(p.id, soldOut ? { is_available: true, stock: p.stock || 1 } : { is_available: false })}>
        {soldOut ? 'Back in stock' : 'Mark sold out'}
      </button>
    </li>
  );
}
