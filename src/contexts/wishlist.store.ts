// src/contexts/wishlist.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  productId: string;
  title: string;
  price: number;
  imageUrl: string;
  slug: string;
}

interface WishlistStore {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  isWished: (productId: string) => boolean;
  count: number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,

      toggle: (item) => {
        const existing = get().items.find(i => i.productId === item.productId);
        if (existing) {
          set(state => ({
            items: state.items.filter(i => i.productId !== item.productId),
            count: state.items.length - 1,
          }));
        } else {
          set(state => ({
            items: [...state.items, item],
            count: state.items.length + 1,
          }));
        }
      },

      isWished: (productId) => {
        return get().items.some(i => i.productId === productId);
      },
    }),
    {
      name: 'amigo-wishlist',
    }
  )
);
