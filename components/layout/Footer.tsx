import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Award, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#121212] text-stone-300 pt-16 pb-12 border-t border-[#D4AF37]/30">
      {/* Trust Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-stone-800">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-semibold text-white">100% BIS Hallmarked</h4>
            <p className="text-xs text-stone-400">Govt. certified 22K & 18K Gold authenticity guaranteed</p>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-semibold text-white">Certified Diamonds</h4>
            <p className="text-xs text-stone-400">IGI & GIA certified conflict-free solitaires & polki</p>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-semibold text-white">Insured Free Shipping</h4>
            <p className="text-xs text-stone-400">Tamper-proof armoured delivery by Blue Dart Express</p>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-semibold text-white">15-Day Easy Returns</h4>
            <p className="text-xs text-stone-400">100% money back guarantee with lifetime exchange</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl font-bold tracking-widest text-[#FAF8F5] uppercase">
              Jewellery Mate
            </span>
            <span className="block text-[10px] tracking-[0.3em] uppercase text-[#D4AF37]">
              Handcrafted Indian Elegance
            </span>
          </Link>
          <p className="text-xs text-stone-400 leading-relaxed pr-6">
            Jewellery Mate embodies the immortal heritage of royal Indian craftsmanship. From majestic
            Kundan and uncut Polki to certified contemporary solitaires, each piece is handcrafted
            with devotion and hallmarked purity.
          </p>
          <div className="pt-2 flex items-center space-x-3 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              WhatsApp Concierge Active
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h5 className="font-serif text-sm font-semibold text-white uppercase tracking-wider text-[#D4AF37]">
            Collections
          </h5>
          <ul className="space-y-2 text-xs">
            <li><Link href="/category/rings" className="hover:text-[#D4AF37] transition-colors">Gold & Solitaire Rings</Link></li>
            <li><Link href="/category/necklaces" className="hover:text-[#D4AF37] transition-colors">Temple Haarams & Chokers</Link></li>
            <li><Link href="/category/earrings" className="hover:text-[#D4AF37] transition-colors">Jhumkas & Balis</Link></li>
            <li><Link href="/category/bangles-bracelets" className="hover:text-[#D4AF37] transition-colors">Bridal Kadas & Bangles</Link></li>
            <li><Link href="/category/solitaires" className="hover:text-[#D4AF37] transition-colors">Certified Solitaires</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="space-y-3">
          <h5 className="font-serif text-sm font-semibold text-white uppercase tracking-wider text-[#D4AF37]">
            Customer Care
          </h5>
          <ul className="space-y-2 text-xs">
            <li><Link href="/track-order" className="hover:text-[#D4AF37] transition-colors">Track Order Status</Link></li>
            <li><Link href="/checkout" className="hover:text-[#D4AF37] transition-colors">Cart & Checkout</Link></li>
            <li><span className="text-stone-400">Shipping & Delivery Policy</span></li>
            <li><span className="text-stone-400">Gold Purity & Hallmarking</span></li>
            <li><span className="text-stone-400">Lifetime Exchange & Buyback</span></li>
          </ul>
        </div>

        {/* Flagship Boutiques & Contact */}
        <div className="space-y-3">
          <h5 className="font-serif text-sm font-semibold text-white uppercase tracking-wider text-[#D4AF37]">
            Boutique & Concierge
          </h5>
          <div className="space-y-2 text-xs text-stone-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <span>Zaveri Bazaar, Kalbadevi, Mumbai 400002</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span>+91 98765 43210 (Toll-Free)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span>concierge@jewellerymate.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-4 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 Jewellery Mate India Private Limited. All rights reserved.</p>
        <p className="text-[11px] text-stone-500">
          Crafted with devotion for the Indian Luxury Jewellery Market.
        </p>
      </div>
    </footer>
  );
}
