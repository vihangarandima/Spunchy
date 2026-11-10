// Small UI state shared across components (not persisted).
import { create } from 'zustand'

type UiState = {
  /** Text tone the current hero slide needs: 'light' text on dark slides, 'dark' on light. */
  heroTone: 'light' | 'dark'
  setHeroTone: (t: 'light' | 'dark') => void
  searchOpen: boolean
  setSearchOpen: (o: boolean) => void
}

export const useUi = create<UiState>()((set) => ({
  heroTone: 'light',
  setHeroTone: (heroTone) => set({ heroTone }),
  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
}))
