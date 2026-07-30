import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LangState {
  lang: 'fr' | 'ar';
  toggleLang: () => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'fr',
      toggleLang: () => set((state) => ({ lang: state.lang === 'fr' ? 'ar' : 'fr' })),
    }),
    {
      name: 'lang-storage',
    }
  )
);
