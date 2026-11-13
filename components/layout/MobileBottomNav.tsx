'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Gem,
  Search,
  ShoppingBag,
  User,
  X,
  ArrowRight,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useCustomerStore } from '@/lib/customer-store';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const totalCount = useCartStore((s) => s.getTotalCount());
  const openCart = useCartStore((s) => s.openDrawer);
  const { user, fetchUser } = useCustomerStore();

  useEffect(() => {
    setMounted(true);
    fetchUser();
  }, [fetchUser]);

  // Don't render on admin dashboard routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchModalOpen(false);
      window.location.href = `/category/all?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const isHomeActive = pathname === '/';
  const isCollectionsActive = pathname.startsWith('/category');
  const isAccountActive = pathname === '/account' || pathname === '/login' || pathname === '/register';

  return (
    <>
      {/* 1. Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-stone-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-[max(env(safe-area-inset-bottom),0px)]"
      >
        <div className="grid grid-cols-5 h-16 items-center max-w-md mx-auto px-2">
          {/* Tab 1: Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              isHomeActive
                ? 'text-[#9A7B1C]'
                : 'text-stone-500 hover:text-stone-900 active:scale-95'
            }`}
          >
            <div className="relative">
              <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {isHomeActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37]" />
              )}
            </div>
            <span className={`text-[10px] mt-1 tracking-tight ${isHomeActive ? 'font-bold' : 'font-medium'}`}>
              Home
            </span>
          </Link>

          {/* Tab 2: Collections */}
          <Link
            href="/category/all"
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              isCollectionsActive
                ? 'text-[#9A7B1C]'
                : 'text-stone-500 hover:text-stone-900 active:scale-95'
            }`}
          >
            <div className="relative">
              <Gem className={`w-5 h-5 ${isCollectionsActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {isCollectionsActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37]" />
              )}
            </div>
            <span className={`text-[10px] mt-1 tracking-tight ${isCollectionsActive ? 'font-bold' : 'font-medium'}`}>
              Catalog
            </span>
          </Link>

          {/* Tab 3: Search Modal Button */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-stone-500 hover:text-stone-900 active:scale-95 transition-all"
            aria-label="Search jewellery"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-1 font-medium tracking-tight">Search</span>
          </button>

          {/* Tab 4: Shopping Bag / Cart */}
          <button
            type="button"
            onClick={openCart}
            className="relative flex flex-col items-center justify-center py-1 text-stone-500 hover:text-stone-900 active:scale-95 transition-all"
            aria-label="Open Shopping Bag"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {mounted && totalCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#D4AF37] text-stone-950 text-[10px] font-black rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 shadow-sm border border-white">
                  {totalCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium tracking-tight">Bag</span>
          </button>

          {/* Tab 5: Account / Profile */}
          <Link
            href={mounted && user ? '/account' : '/login'}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              isAccountActive
                ? 'text-[#9A7B1C]'
                : 'text-stone-500 hover:text-stone-900 active:scale-95'
            }`}
          >
            <div className="relative">
              <User className={`w-5 h-5 ${isAccountActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {isAccountActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37]" />
              )}
            </div>
            <span className={`text-[10px] mt-1 tracking-tight ${isAccountActive ? 'font-bold' : 'font-medium'}`}>
              {mounted && user ? user.name.split(' ')[0] : 'Account'}
            </span>
          </Link>
        </div>
      </nav>

      {/* 2. Fullscreen Mobile Search Overlay */}
      {searchModalOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md flex flex-col justify-start animate-in fade-in duration-200">
          <div className="bg-white p-4 shadow-xl border-b border-stone-200">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs uppercase tracking-widest font-bold text-[#9A7B1C]">
                Search Fine Jewellery
              </span>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-800 rounded-full"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-[#9A7B1C] absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search rings, temple necklaces, solitaires..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm py-3 pl-10 pr-12 rounded-xl border border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 bg-stone-50"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-1.5 bg-stone-900 text-white rounded-lg hover:bg-[#9A7B1C] transition-colors"
                aria-label="Submit search"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular Quick Search Pills */}
            <div className="mt-3.5 pt-3 border-t border-stone-100">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-600 block mb-2">
                Popular Searches:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['22K Gold', 'Solitaire Rings', 'Temple Haaram', 'Polki Choker', 'Bridal Kada', 'Jhumkas'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchModalOpen(false);
                      window.location.href = `/category/all?search=${encodeURIComponent(tag)}`;
                    }}
                    className="text-xs px-2.5 py-1 rounded-full bg-stone-100 hover:bg-[#FAF8F5] hover:border-[#D4AF37] border border-stone-200 text-stone-700 transition-colors active:scale-95"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Category Shortcuts */}
            <div className="mt-4 pt-3 border-t border-stone-100">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-600 block mb-2.5">
                Browse Collections:
              </span>
              <div className="grid grid-cols-5 gap-2 text-center">
                {[
                  { name: 'Rings', slug: 'rings', img: '/categories/rings.jpg' },
                  { name: 'Necklaces', slug: 'necklaces', img: '/categories/necklaces.jpg' },
                  { name: 'Earrings', slug: 'earrings', img: '/categories/earrings.jpg' },
                  { name: 'Bangles', slug: 'bangles-bracelets', img: '/categories/bangles.jpg' },
                  { name: 'Solitaires', slug: 'solitaires', img: '/categories/solitaires.jpg' },
                ].map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    onClick={() => setSearchModalOpen(false)}
                    className="flex flex-col items-center group active:scale-95"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#D4AF37]/40 shadow-sm group-hover:border-[#D4AF37]">
                      <img
                        src={c.img}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/products/gold-floral-ring.jpg';
                        }}
                      />
                    </div>
                    <span className="text-[10.5px] font-medium text-stone-800 mt-1 truncate max-w-[55px]">
                      {c.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div
            className="flex-1"
            onClick={() => setSearchModalOpen(false)}
          />
        </div>
      )}
    </>
  );
}

