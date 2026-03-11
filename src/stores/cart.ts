import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types/database';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  updateInstallType: (variantId: string, installType: 'self' | 'professional' | null) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.variantId !== variantId)
            : state.items.map((i) =>
                i.variantId === variantId ? { ...i, quantity } : i
              ),
        })),
      updateInstallType: (variantId, installType) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, installType } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce(
          (total, item) => total + (item.variant?.price ?? 0) * item.quantity,
          0
        ),
      getItemCount: () =>
        get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: 'allah-hu-autos-cart',
    }
  )
);
