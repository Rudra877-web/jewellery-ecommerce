'use client';

import React from 'react';
import { ShieldCheck, Gem, Truck, RotateCcw } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: '100% BIS Hallmarked',
    subtitle: 'Govt. certified 22K & 18K pure gold guarantee',
  },
  {
    icon: Gem,
    title: 'Certified Solitaires',
    subtitle: 'IGI & GIA certified conflict-free diamonds',
  },
  {
    icon: Truck,
    title: 'Insured Armoured Transit',
    subtitle: 'Free tamper-proof Blue Dart delivery across India',
  },
  {
    icon: RotateCcw,
    title: '15-Day Easy Returns',
    subtitle: '100% money back & lifetime exchange guarantee',
  },
];

export default function TrustBar() {
  return (
    <section className="bg-gradient-to-b from-[#1C1813] to-stone-950 text-white border-y border-[#D4AF37]/30 py-6 sm:py-8 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Horizontal Snap Scroll (< md) */}
        <div className="flex md:hidden overflow-x-auto gap-3.5 pb-2 no-scrollbar -mx-4 px-4 snap-x snap-mandatory">
          {TRUST_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 bg-stone-900/80 border border-[#D4AF37]/25 rounded-2xl p-3.5 min-w-[260px] flex-shrink-0 snap-start shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#9A7B1C]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#E6CA65] flex-shrink-0 shadow">
                  <Icon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif text-sm font-semibold text-white tracking-wide truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-stone-400 leading-tight mt-0.5 line-clamp-2">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop & Tablet 4-Column Grid (>= md) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-900/40 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:bg-stone-900/70 transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#9A7B1C]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#E6CA65] flex-shrink-0 group-hover:scale-110 transition-transform shadow">
                  <Icon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-white tracking-wide group-hover:text-[#E6CA65] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-stone-400 leading-snug mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

