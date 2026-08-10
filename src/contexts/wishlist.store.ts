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
  toggle: (idOrItem: string | WishlistItem) => void;
  isWished: (productId: string) => boolean;
  count: number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,

      toggle: (idOrItem) => {
        // Accept either a full item object or just an ID string
        const productId = typeof idOrItem === 'string' ? idOrItem : idOrItem.productId;
        const existing = get().items.find(i => i.productId === productId);
        if (existing) {
          set(state => ({
            items: state.items.filter(i => i.productId !== productId),
            count: Math.max(0, state.items.length - 1),
          }));
        } else if (typeof idOrItem === 'object') {
          set(state => ({
            items: [...state.items, idOrItem],
            count: state.items.length + 1,
          }));
        }
        // If only string ID provided and not in list, we can't add (no full product data)
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
