'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Gem,
  FileSpreadsheet,
  RefreshCw,
  Sliders,
  ShoppingBag,
  Settings,
  ExternalLink,
  LogOut,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    fetch('/api/admin/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        router.replace('/admin/login');
      });
  }, [pathname, router]);

  // If on login page, render full screen without admin sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Show security verification loader while checking auth
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 text-stone-300 space-y-4">
        <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center bg-[#D4AF37]/10">
          <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
        </div>
        <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
          Verifying Admin Authorization...
        </p>
      </div>
    );
  }

  const navLinks = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Catalog & Products', href: '/admin/products', icon: Gem },
    { label: 'CSV Bulk Import', href: '/admin/import', icon: FileSpreadsheet },
    { label: 'Google Sheet Sync', href: '/admin/sync', icon: RefreshCw },
    { label: 'Hero Slider Banners', href: '/admin/slider', icon: Sliders },
    { label: 'Orders & Shipments', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Integration Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row text-stone-900">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-stone-950 text-stone-300 flex-shrink-0 flex flex-col justify-between border-r border-[#D4AF37]/20">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-stone-800/80">
            <Link href="/admin" className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-widest text-white uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Jewellery Mate
              </span>
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">
                Admin Management Console
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 text-xs font-medium">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-stone-900 text-[#E6CA65] font-semibold border-l-2 border-[#D4AF37]'
                      : 'hover:bg-stone-900 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-stone-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-stone-800/80 space-y-2 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-stone-400 hover:bg-stone-900 hover:text-white transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <form action="/api/admin/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
