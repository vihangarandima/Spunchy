// Cart state. Persisted to localStorage (spunchy-cart-v1); rehydrated after mount so the
// prerendered HTML (empty cart) and the first client render match.
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { productBySlug } from '../content/products'

export type CartLine = {
  key: string
  productId: string
  name: string
  option: string | null
  flavour: string | null
  message: string | null
  unitPrice: number
  qty: number
}

type Toast = { id: number; text: string } | null

type CartState = {
  lines: CartLine[]
  drawerOpen: boolean
  toast: Toast
  add: (line: Omit<CartLine, 'key' | 'qty'>, qty?: number) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
  openDrawer: (open: boolean) => void
  showToast: (text: string) => void
}

export const lineKey = (l: Pick<CartLine, 'productId' | 'option' | 'flavour' | 'message'>) =>
  [l.productId, l.option ?? '', l.flavour ?? '', l.message ?? ''].join('|')

const safeStorage = createJSONStorage(() => {
  try {
    const s = window.localStorage
    s.getItem('x')
    return s
  } catch {
    const mem = new Map<string, string>()
    return { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) }
  }
})

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      drawerOpen: false,
      toast: null,
      add: (line, qty = 1) => {
        const key = lineKey(line)
        const lines = get().lines
        const existing = lines.find((l) => l.key === key)
        set({
          lines: existing
            ? lines.map((l) => (l.key === key ? { ...l, qty: Math.min(99, l.qty + qty) } : l))
            : [...lines, { ...line, key, qty }],
        })
      },
      setQty: (key, qty) =>
        set({ lines: qty <= 0 ? get().lines.filter((l) => l.key !== key) : get().lines.map((l) => (l.key === key ? { ...l, qty: Math.min(99, qty) } : l)) }),
      remove: (key) => set({ lines: get().lines.filter((l) => l.key !== key) }),
      clear: () => set({ lines: [] }),
      openDrawer: (open) => set({ drawerOpen: open }),
      showToast: (text) => set({ toast: { id: Date.now(), text } }),
    }),
    {
      name: 'spunchy-cart-v1',
      storage: safeStorage,
      skipHydration: true,
      partialize: (s) => ({ lines: s.lines }),
      // Drop lines whose product disappeared or lost its price since they were saved.
      merge: (persisted, current) => {
        const lines = ((persisted as { lines?: CartLine[] })?.lines ?? []).filter((l) => productBySlug(l.productId))
        return { ...current, lines }
      },
    },
  ),
)

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0)
export const cartTotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty * l.unitPrice, 0)

/** Quantity of a simple (no options) product in the cart, for card steppers. */
export const useSimpleLine = (productId: string) =>
  useCart((s) => s.lines.find((l) => l.key === lineKey({ productId, option: null, flavour: null, message: null })))
