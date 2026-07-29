// src/contexts/cart.store.ts

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';

export interface CartItem {
  id: string;           // Unique ID للـ Line Item
  productId: string;    // Sanity Document ID
  title: string;
  price: number;
  comparePrice?: number;
  imageUrl: string;
  slug: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartStore {
  // State
  items: CartItem[];
  isOpen: boolean;
  lastAddedId: string | null;
  
  // Computed
  get totalItems(): number;
  get totalPrice(): number;
  get hasItems(): boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
        items: [],
        isOpen: false,
        lastAddedId: null,

        // Computed (getters)
        get totalItems() {
          return get().items.reduce((sum, item) => sum + item.quantity, 0);
        },

        get totalPrice() {
          return get().items.reduce(
            (sum, item) => sum + (item.price || 0) * item.quantity,
            0
          );
        },

        get hasItems() {
          return get().items.length > 0;
        },

        // Actions
        addItem: (newItem) =>
          set((state) => {
            // البحث عن منتج مطابق (نفس المنتج + نفس المقاس + نفس اللون)
            const existingIndex = state.items.findIndex(
              (item) =>
                item.productId === newItem.productId &&
                item.selectedSize === newItem.selectedSize &&
                item.selectedColor === newItem.selectedColor
            );

            if (existingIndex !== -1) {
              // زيادة الكمية بدون تجاوز 10
              const newQty = Math.min(
                state.items[existingIndex].quantity + (newItem.quantity || 1),
                10
              );
              state.items[existingIndex].quantity = newQty;
              state.lastAddedId = state.items[existingIndex].id;
            } else {
              // إضافة منتج جديد
              const id = nanoid(8);
              state.items.push({
                ...newItem,
                id,
                quantity: Math.min(newItem.quantity || 1, 10),
              });
              state.lastAddedId = id;
            }
          }),

        removeItem: (id) =>
          set((state) => {
            state.items = state.items.filter((item) => item.id !== id);
          }),

        updateQuantity: (id, quantity) =>
          set((state) => {
            if (quantity <= 0) {
              state.items = state.items.filter((item) => item.id !== id);
              return;
            }
            const item = state.items.find((item) => item.id === id);
            if (item) {
              item.quantity = Math.min(quantity, 10);
            }
          }),

        clearCart: () =>
          set((state) => {
            state.items = [];
            state.lastAddedId = null;
          }),

        openCart: () =>
          set((state) => {
            state.isOpen = true;
          }),

        closeCart: () =>
          set((state) => {
            state.isOpen = false;
          }),

        toggleCart: () =>
          set((state) => {
            state.isOpen = !state.isOpen;
          }),
      })),
      {
        name: 'amigo-moda-cart', // localStorage key
        version: 1,
        // تخزين Items فقط (ليس isOpen)
        partialize: (state) => ({
          items: state.items,
        }),
      }
    ),
    { name: 'CartStore' }
  )
);

// Selectors محسَّنة (لتجنب re-renders غير ضرورية)
export const useCartItems = () => useCartStore((s) => s.items);
export const useCartTotalItems = () =>
  useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
export const useCartTotalPrice = () =>
  useCartStore((s) =>
    s.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
  );
export const useCartIsOpen = () => useCartStore((s) => s.isOpen);
export const useCartActions = () =>
  useCartStore((s) => ({
    addItem: s.addItem,
    removeItem: s.removeItem,
    updateQuantity: s.updateQuantity,
    clearCart: s.clearCart,
    openCart: s.openCart,
    closeCart: s.closeCart,
    toggleCart: s.toggleCart,
  }));
