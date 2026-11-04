'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  User,
  Truck,
  ChevronDown,
  Package,
  LogOut,
  LogIn,
  Settings,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useCustomerStore } from '@/lib/customer-store';

interface HeaderProps {
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export default function Header({ categories = [] }: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const totalCount = useCartStore((s) => s.getTotalCount());
  const openCart = useCartStore((s) => s.openDrawer);

  const { user, fetchUser, logout } = useCustomerStore();

  useEffect(() => {
    setMounted(true);
    fetchUser();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fetchUser]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/category/all?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navCategories = categories.length > 0 ? categories : [
    { id: '1', name: 'Rings', slug: 'rings' },
    { id: '2', name: 'Necklaces', slug: 'necklaces' },
    { id: '3', name: 'Earrings', slug: 'earrings' },
    { id: '4', name: 'Bangles & Bracelets', slug: 'bangles-bracelets' },
    { id: '5', name: 'Solitaires', slug: 'solitaires' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-[#171717] text-[#FAF8F5] text-xs py-2 px-4 text-center tracking-widest uppercase flex items-center justify-center gap-4 border-b border-[#D4AF37]/20">
        <span className="flex items-center gap-1.5 text-[#E6CA65]">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          Complimentary Insured Delivery Across India
        </span>
        <span className="hidden md:inline text-neutral-500">|</span>
        <span className="hidden md:flex items-center gap-1 text-neutral-300">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          100% BIS Hallmarked & Certified Diamonds
        </span>
      </div>

      {/* Main Navigation Bar */}
      <nav
        className={`w-full transition-all duration-200 border-b ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-[#E7E5E4]'
            : 'bg-white border-[#E7E5E4]/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-stone-700 hover:text-[#9A7B1C] transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Logo */}
            <div className="flex-1 lg:flex-none text-center lg:text-left">
              <Link href="/" className="inline-block group">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-widest text-stone-900 group-hover:text-[#9A7B1C] transition-colors uppercase">
                    Jewellery Mate
                  </span>
                  <span className="text-[9px] tracking-[0.3em] uppercase text-[#9A7B1C] -mt-1 font-medium">
                    Haute Joaillerie
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Category Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {navCategories.map((cat) => {
                const isActive = pathname === `/category/${cat.slug}`;
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className={`text-sm font-medium tracking-wide uppercase transition-colors relative py-1 ${
                      isActive
                        ? 'text-[#9A7B1C] font-semibold'
                        : 'text-stone-700 hover:text-[#9A7B1C]'
                    }`}
                  >
                    {cat.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Header Actions (Search, Track, Account, Cart) */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Toggle / Form */}
              <div className="relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center">
                    <input
                      type="text"
                      placeholder="Search gold, rings, polki..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-48 sm:w-64 text-xs py-1.5 px-3 rounded-full border border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-stone-50"
                    />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="ml-1 p-1 text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-stone-700 hover:text-[#9A7B1C] transition-colors"
                    aria-label="Search catalogue"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Order Tracking Link */}
              <Link
                href="/track-order"
                className="hidden sm:flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-[#9A7B1C] p-2 transition-colors"
                title="Track your order"
              >
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <span className="hidden xl:inline">Track Order</span>
              </Link>

              {/* Customer Account / Sign In Dropdown */}
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${
                    accountMenuOpen || user
                      ? 'text-[#9A7B1C] bg-stone-100/80'
                      : 'text-stone-700 hover:text-[#9A7B1C]'
                  }`}
                  aria-label="Account options"
                >
                  <User className="w-5 h-5" />
                  {mounted && user && (
                    <span className="hidden md:inline text-xs font-semibold max-w-[100px] truncate text-stone-900">
                      {user.name.split(' ')[0]}
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 text-stone-400 hidden sm:inline" />
                </button>

                {/* Dropdown Menu */}
                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {mounted && user ? (
                      <>
                        <div className="px-4 py-2.5 border-b border-stone-100">
                          <span className="text-[10px] uppercase tracking-wider text-[#9A7B1C] font-bold block">
                            Logged In
                          </span>
                          <span className="text-xs font-bold text-stone-900 block truncate">
                            {user.name}
                          </span>
                          <span className="text-[11px] text-stone-500 font-mono">
                            +91 {user.phone}
                          </span>
                        </div>

                        <Link
                          href="/account"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 hover:text-[#9A7B1C] transition-colors"
                        >
                          <Package className="w-4 h-4 text-[#D4AF37]" />
                          <span>My Orders & Profile</span>
                        </Link>

                        <Link
                          href="/track-order"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 hover:text-[#9A7B1C] transition-colors"
                        >
                          <Truck className="w-4 h-4 text-[#D4AF37]" />
                          <span>Track Shipment</span>
                        </Link>

                        <div className="border-t border-stone-100 my-1" />

                        <Link
                          href="/admin"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Admin Portal</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 border-b border-stone-100">
                          <span className="text-xs font-serif font-bold text-stone-900 block">
                            Welcome to Jewellery Mate
                          </span>
                          <span className="text-[10px] text-stone-500">
                            Sign in to track orders and save bespoke pieces
                          </span>
                        </div>

                        <Link
                          href="/login"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-stone-900 hover:bg-[#FAF8F5] hover:text-[#9A7B1C] transition-colors"
                        >
                          <LogIn className="w-4 h-4 text-[#D4AF37]" />
                          <span>Customer Sign In / Register</span>
                        </Link>

                        <Link
                          href="/track-order"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                        >
                          <Truck className="w-4 h-4 text-stone-400" />
                          <span>Track Order</span>
                        </Link>

                        <div className="border-t border-stone-100 my-1" />

                        <Link
                          href="/admin"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-[11px] text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Store Admin Portal</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Button with Count */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2.5 bg-stone-900 text-white rounded-full hover:bg-[#9A7B1C] transition-all shadow-sm flex items-center justify-center"
                aria-label={mounted && totalCount > 0 ? `Shopping Cart with ${totalCount} items` : 'Shopping Cart'}
              >
                <ShoppingBag className="w-4 h-4 text-[#FAF8F5]" />
                {mounted && totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-stone-900 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md border-2 border-white">
                    {totalCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
            {/* Mobile Search input */}
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <input
                type="text"
                placeholder="Search jewellery by metal, gemstone, style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm py-2 pl-9 pr-4 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37] bg-stone-50"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </form>

            {/* Mobile Customer Status Banner */}
            {mounted && user ? (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-900 block">{user.name}</span>
                  <span className="text-[10px] text-stone-500 font-mono">+91 {user.phone}</span>
                </div>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1 bg-stone-900 text-white text-xs font-semibold rounded-lg"
                >
                  My Account
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider"
              >
                <LogIn className="w-4 h-4 text-[#D4AF37]" />
                <span>Customer Sign In / Register</span>
              </Link>
            )}

            <div className="flex flex-col space-y-2 pt-1">
              <div className="text-xs uppercase tracking-wider font-semibold text-stone-400 px-2 py-1">
                Jewellery Categories
              </div>
              {navCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-base font-medium text-stone-800 hover:bg-stone-50 hover:text-[#9A7B1C] rounded-md transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-100 flex flex-col space-y-2">
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm text-stone-600 hover:text-[#9A7B1C] flex items-center gap-2"
              >
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                Track Shiprocket Order
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm text-stone-600 hover:text-[#9A7B1C] flex items-center gap-2"
              >
                <User className="w-4 h-4 text-[#D4AF37]" />
                Admin Portal
              </Link>
              {mounted && user && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left flex items-center gap-2 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
