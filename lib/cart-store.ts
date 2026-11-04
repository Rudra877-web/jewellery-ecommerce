'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '@/types/jewellery';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  getTotalCount: () => number;
  getSubtotal: () => number;
  getMrpTotal: () => number;
  getSavings: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (product, qty = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.sku === product.sku);
          if (existingIndex > -1) {
            const nextItems = [...state.items];
            const current = nextItems[existingIndex];
            const newQty = Math.min(current.quantity + qty, product.stock || 99);
            nextItems[existingIndex] = { ...current, quantity: newQty };
            return { items: nextItems, isDrawerOpen: true };
          } else {
            return {
              items: [...state.items, { ...product, quantity: Math.min(qty, product.stock || 99) }],
              isDrawerOpen: true,
            };
          }
        });
      },

      removeItem: (sku) => {
        set((state) => ({
          items: state.items.filter((i) => i.sku !== sku),
        }));
      },

      updateQuantity: (sku, qty) => {
        if (qty <= 0) {
          get().removeItem(sku);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.sku === sku ? { ...i, quantity: Math.min(qty, i.stock || 99) } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getMrpTotal: () => {
        return get().items.reduce((sum, item) => sum + (item.mrp || item.price) * item.quantity, 0);
      },

      getSavings: () => {
        const subtotal = get().getSubtotal();
        const mrp = get().getMrpTotal();
        return Math.max(0, mrp - subtotal);
      },
    }),
    {
      name: 'jewellery_mate_cart_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
