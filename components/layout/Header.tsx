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
  Phone,
  ArrowRight,
  Gem,
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  const totalCount = useCartStore((s) => s.getTotalCount());
  const openCart = useCartStore((s) => s.openDrawer);

  const { user, fetchUser, logout } = useCustomerStore();

  useEffect(() => {
    setMounted(true);
    fetchUser();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
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

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

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
    <header className="sticky top-0 z-50 w-full font-sans transition-all duration-300">
      {/* 1. Luxury Top Announcement Bar */}
      <div className="bg-gradient-to-r from-stone-950 via-[#1C1813] to-stone-950 text-stone-200 text-[11px] py-2 px-4 border-b border-[#D4AF37]/25 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Feature Pill */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[#E6CA65] font-medium tracking-wider uppercase text-[10.5px]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              <span>Complimentary Insured Delivery Across India</span>
            </span>
            <span className="hidden md:inline text-stone-600">|</span>
            <span className="hidden md:flex items-center gap-1 text-stone-400 text-[10.5px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>100% BIS Hallmarked & Certified Solitaires</span>
            </span>
          </div>

          {/* Right Support Contact & Quick Links */}
          <div className="hidden sm:flex items-center gap-4 text-stone-400 text-[10.5px]">
            <a
              href="tel:+916352273970"
              className="hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
            >
              <Phone className="w-3 h-3 text-[#D4AF37]" />
              <span>Concierge: +91 63522 73970</span>
            </a>
            <span className="text-stone-700">|</span>
            <Link
              href="/track-order"
              className="hover:text-[#D4AF37] flex items-center gap-1 transition-colors tracking-wider uppercase text-[10px] font-semibold text-stone-300"
            >
              <Truck className="w-3 h-3 text-[#D4AF37]" />
              <span>Track Order</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Luxury Navigation Bar */}
      <nav
        className={`w-full transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.06)] border-[#D4AF37]/20 py-2.5'
            : 'bg-white border-stone-200/90 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Hamburger Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-stone-800 hover:text-[#9A7B1C] transition-colors rounded-lg hover:bg-stone-50"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Logo with Royal Jewellery Insignia */}
            <div className="flex-1 lg:flex-none text-center lg:text-left">
              <Link href="/" className="inline-flex items-center gap-3 group">
                {/* Royal Monogram Icon */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-stone-900 to-stone-950 border border-[#D4AF37]/60 flex items-center justify-center shadow-md group-hover:border-[#D4AF37] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all">
                  <Gem className="w-4 h-4 text-[#D4AF37] transition-transform duration-300 group-hover:scale-110" />
                </div>

                {/* Typography */}
                <div className="flex flex-col text-left">
                  <span className="font-serif text-2xl sm:text-[26px] font-bold tracking-[0.18em] text-stone-950 group-hover:text-[#9A7B1C] transition-colors uppercase leading-tight">
                    Jewellery Mate
                  </span>
                  <span className="text-[8.5px] tracking-[0.35em] uppercase text-[#9A7B1C] font-semibold">
                    Haute Joaillerie • Est. 2026
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-7">
              <Link
                href="/category/all"
                className={`text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors relative py-1 group ${
                  pathname === '/category/all'
                    ? 'text-[#9A7B1C]'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                <span>All Creations</span>
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] transition-transform duration-300 origin-left ${
                    pathname === '/category/all' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>

              {navCategories.map((cat) => {
                const isActive = pathname === `/category/${cat.slug}`;
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className={`text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors relative py-1 group ${
                      isActive
                        ? 'text-[#9A7B1C]'
                        : 'text-stone-700 hover:text-stone-950'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] transition-transform duration-300 origin-left ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Header Right Actions (Search, Account, Cart) */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Expandable Search */}
              <div className="relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center">
                    <div className="relative flex items-center">
                      <Search className="w-3.5 h-3.5 text-[#9A7B1C] absolute left-3 pointer-events-none" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search diamonds, rings, gold..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-48 sm:w-64 text-xs py-2 pl-8 pr-8 rounded-full border border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 bg-stone-50 shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        className="absolute right-2 p-1 text-stone-400 hover:text-stone-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2.5 text-stone-700 hover:text-[#9A7B1C] hover:bg-[#FAF8F5] rounded-full transition-colors flex items-center gap-1.5"
                    aria-label="Search catalogue"
                    title="Search fine jewellery"
                  >
                    <Search className="w-4 h-4 text-stone-700" />
                  </button>
                )}
              </div>

              {/* Order Tracking Pill (Desktop) */}
              <Link
                href="/track-order"
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-[#D4AF37] hover:bg-[#FDFBF7] transition-all"
              >
                <Truck className="w-3.5 h-3.5 text-[#9A7B1C]" />
                <span className="tracking-wide text-[11px] uppercase">Track Order</span>
              </Link>

              {/* Customer Account / Sign In Dropdown */}
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    accountMenuOpen || (mounted && user)
                      ? 'border-[#D4AF37] text-stone-900 bg-[#FDFBF7] shadow-sm'
                      : 'border-stone-200 text-stone-700 hover:border-[#D4AF37] hover:text-[#9A7B1C] hover:bg-[#FAF8F5]'
                  }`}
                  aria-label="Account options"
                >
                  <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[#9A7B1C]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  {mounted && user ? (
                    <span className="hidden md:inline text-xs font-bold max-w-[90px] truncate text-stone-900">
                      {user.name.split(' ')[0]}
                    </span>
                  ) : (
                    <span className="hidden md:inline text-[11px] font-semibold uppercase tracking-wider text-stone-700">
                      Account
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 text-stone-400 hidden sm:inline" />
                </button>

                {/* Dropdown Menu */}
                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200/90 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {mounted && user ? (
                      <>
                        <div className="px-4 py-3 border-b border-stone-100 bg-[#FAF9F6]">
                          <span className="text-[10px] uppercase tracking-wider text-[#9A7B1C] font-bold block">
                            Logged In Member
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
                          <span className="font-medium">My Orders & Address Profile</span>
                        </Link>

                        <Link
                          href="/track-order"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 hover:text-[#9A7B1C] transition-colors"
                        >
                          <Truck className="w-4 h-4 text-[#D4AF37]" />
                          <span className="font-medium">Track Live Shiprocket Shipment</span>
                        </Link>

                        <div className="border-t border-stone-100 my-1" />

                        <Link
                          href="/admin"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Store Admin Portal</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-stone-100 bg-[#FAF9F6]">
                          <span className="text-xs font-serif font-bold text-stone-900 block">
                            Welcome to Jewellery Mate
                          </span>
                          <span className="text-[10px] text-stone-500">
                            Sign in to track orders, save shipping address and bespoke pieces
                          </span>
                        </div>

                        <div className="p-2">
                          <Link
                            href="/login"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-stone-950 hover:bg-[#9A7B1C] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                          >
                            <LogIn className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Sign In / Register</span>
                          </Link>
                        </div>

                        <Link
                          href="/track-order"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                        >
                          <Truck className="w-4 h-4 text-stone-400" />
                          <span>Track Order (No login required)</span>
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

              {/* Luxury Cart Pill with Live Item Count */}
              <button
                type="button"
                onClick={openCart}
                className="relative flex items-center gap-2 pl-3.5 pr-4 py-2 bg-gradient-to-r from-stone-950 to-stone-900 hover:from-[#9A7B1C] hover:to-[#B38F24] text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg group"
                aria-label={mounted && totalCount > 0 ? `Shopping Cart with ${totalCount} items` : 'Shopping Cart'}
              >
                <ShoppingBag className="w-4 h-4 text-[#FAF8F5] transition-transform duration-200 group-hover:scale-110" />
                <span className="hidden sm:inline text-[11px] font-bold tracking-wider uppercase">
                  Cart
                </span>
                {mounted && totalCount > 0 ? (
                  <span className="bg-[#D4AF37] text-stone-950 text-[10px] font-extrabold rounded-full px-1.5 py-0.5 min-w-[20px] text-center shadow">
                    {totalCount}
                  </span>
                ) : (
                  <span className="text-stone-400 text-[10px] hidden sm:inline">(0)</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Mobile Navigation Drawer (Luxury Slide-down) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200/90 bg-white px-5 pt-4 pb-8 space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-[#9A7B1C] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search gold, solitaire, necklaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37] bg-stone-50"
              />
            </form>

            {/* Mobile Member Status Card */}
            {mounted && user ? (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#FDFBF7] to-[#FAF8F5] border border-[#D4AF37]/30 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9A7B1C] font-bold block">
                    Welcome Member
                  </span>
                  <span className="text-xs font-bold text-stone-900 block">{user.name}</span>
                  <span className="text-[11px] text-stone-500 font-mono">+91 {user.phone}</span>
                </div>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-[#9A7B1C] transition-colors"
                >
                  My Profile
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-stone-950 text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#9A7B1C] transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4 text-[#D4AF37]" />
                <span>Customer Sign In / Register</span>
              </Link>
            )}

            {/* Categories Listing */}
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-widest font-bold text-[#9A7B1C] px-2 py-1">
                Fine Jewellery Collections
              </div>
              <Link
                href="/category/all"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-stone-900 hover:bg-[#FAF8F5] hover:text-[#9A7B1C] rounded-lg transition-colors"
              >
                <span>All Creations</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>
              {navCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium text-stone-800 hover:bg-[#FAF8F5] hover:text-[#9A7B1C] rounded-lg transition-colors"
                >
                  <span>{cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                </Link>
              ))}
            </div>

            {/* Support and Admin Links */}
            <div className="pt-3 border-t border-stone-100 flex flex-col space-y-1">
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-medium text-stone-700 hover:text-[#9A7B1C] flex items-center gap-2"
              >
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <span>Track Shiprocket Order</span>
              </Link>
              <a
                href="https://wa.me/916352273970"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>WhatsApp Concierge (+91 63522 73970)</span>
              </a>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs text-stone-500 hover:text-stone-900 flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Store Admin Portal</span>
              </Link>
              {mounted && user && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left flex items-center gap-2 rounded-lg font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
