import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ViewedItem {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  comparePrice?: number;
  images: any[];
}

interface RecentlyViewedStore {
  items: ViewedItem[];
  add: (item: ViewedItem) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      add: (item) => set((state) => {
        // Remove if already exists to move it to the top
        const filtered = state.items.filter((i) => i._id !== item._id);
        // Add to beginning, keep max 12
        return { items: [item, ...filtered].slice(0, 12) };
      }),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'amigo-recently-viewed',
    }
  )
);
