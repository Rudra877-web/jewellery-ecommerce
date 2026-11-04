'use client';

import { create } from 'zustand';

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  pincode?: string | null;
  city?: string | null;
  state?: string | null;
  role: string;
  orderCount?: number;
}

interface CustomerState {
  user: CustomerUser | null;
  isLoading: boolean;
  initialized: boolean;
  fetchUser: () => Promise<CustomerUser | null>;
  setUser: (user: CustomerUser | null) => void;
  logout: () => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  user: null,
  isLoading: true,
  initialized: false,

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.authenticated && data.user) {
        set({ user: data.user, isLoading: false, initialized: true });
        return data.user;
      } else {
        set({ user: null, isLoading: false, initialized: true });
        return null;
      }
    } catch {
      set({ user: null, isLoading: false, initialized: true });
      return null;
    }
  },

  setUser: (user) => set({ user, initialized: true }),

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    set({ user: null });
    window.location.href = '/';
  },
}));
