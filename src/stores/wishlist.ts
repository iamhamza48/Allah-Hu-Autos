import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/database';

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  getCount: () => number;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const exists = get().items.find((i) => i.id === product.id);
        if (!exists) {
          set((s) => ({ items: [...s.items, product] }));
        }
      },

      removeItem: (productId) => {
        set((s) => ({ items: s.items.filter((i) => i.id !== productId) }));
      },

      toggleItem: (product) => {
        const exists = get().items.find((i) => i.id === product.id);
        if (exists) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },

      isWishlisted: (productId) => {
        return !!get().items.find((i) => i.id === productId);
      },

      getCount: () => get().items.length,

      clear: () => set({ items: [] }),
    }),
    { name: 'wishlist-storage' }
  )
);