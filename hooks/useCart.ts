'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StateCreator } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  stripe_price_id: string;
  has_core_charge?: boolean;
  core_charge?: number;
  category?: string;
  metadata?: {
    firmwareVersion?: string;
    moduleId?: string;
    offer?: string;
    [key: string]: any;
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const createCartStore: StateCreator<CartStore> = (set) => ({
  items: [],
  addItem: (item: CartItem) =>
    set((state: CartStore) => {
      const existingItem = state.items.find((i: CartItem) => i.id === item.id);
      if (existingItem) {
        return {
          items: state.items.map((i: CartItem) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),
  removeItem: (id: string) =>
    set((state: CartStore) => ({
      items: state.items.filter((item: CartItem) => item.id !== id),
    })),
  updateQuantity: (id: string, quantity: number) =>
    set((state: CartStore) => ({
      items: state.items.map((item: CartItem) =>
        item.id === id ? { ...item, quantity } : item
      ),
    })),
  clearCart: () => set({ items: [] }),
});

const useCart = create<CartStore>()(
  persist(createCartStore, {
    name: 'cart-storage',
    storage: createJSONStorage(() => localStorage),
  })
);

export { useCart }; 