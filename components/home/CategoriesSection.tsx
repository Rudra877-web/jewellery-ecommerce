'use client';

import React from 'react';
import Link from 'next/link';
import { CategoryData } from '@/types/jewellery';
import { handleImageError, CATEGORY_FALLBACK_IMAGES, FALLBACK_JEWELLERY_IMAGE } from '@/lib/image-fallback';

interface CategoriesSectionProps {
  categories: CategoryData[];
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="py-20 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#9A7B1C]">
            Exquisite Craftsmanship
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900">
            Curated Collections
          </h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto rounded-full mt-2" />
          <p className="text-xs sm:text-sm text-stone-600 font-light pt-1">
            Explore masterpieces crafted in pure 22K Gold, uncut Polki diamonds, and certified solitaires.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center text-center focus:outline-none"
            >
              {/* Card Image Container */}
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 group-hover:border-[#D4AF37] shadow-sm group-hover:shadow-xl transition-all duration-500">
                <img
                  src={cat.image || CATEGORY_FALLBACK_IMAGES[cat.slug] || FALLBACK_JEWELLERY_IMAGE}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                  onError={(e) => handleImageError(e, CATEGORY_FALLBACK_IMAGES[cat.slug] || FALLBACK_JEWELLERY_IMAGE)}
                />
                {/* Subtle Luxury Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent group-hover:from-stone-950/90 transition-colors" />

                {/* Floating Content inside Image bottom */}
                <div className="absolute bottom-4 left-0 right-0 px-3 text-center">
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-white tracking-wide group-hover:text-[#E6CA65] transition-colors">
                    {cat.name}
                  </h3>
                  {cat._count?.products !== undefined && (
                    <span className="text-[11px] text-stone-300 font-light tracking-wider">
                      {cat._count.products} Designs
                    </span>
                  )}
                </div>
              </div>

              {/* Text label below card for mobile clarity */}
              <div className="mt-3.5 flex items-center gap-1 text-xs uppercase tracking-widest font-medium text-stone-800 group-hover:text-[#9A7B1C] transition-colors">
                <span>View {cat.name}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
