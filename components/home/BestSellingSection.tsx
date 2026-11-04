import React from 'react';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { ProductData } from '@/types/jewellery';
import ProductCard from '@/components/product/ProductCard';

interface BestSellingSectionProps {
  products: ProductData[];
}

export default function BestSellingSection({ products }: BestSellingSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-stone-200 pb-6 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A7B1C]">
              <Flame className="w-4 h-4 text-[#D4AF37]" />
              <span>Most Adored Creations</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900">
              Best Selling Jewellery
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-light">
              Ranked by our patrons’ cherished orders across India. Handcrafted to order.
            </p>
          </div>

          <Link
            href="/category/all?sort=bestseller"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-stone-900 hover:text-[#9A7B1C] group transition-colors"
          >
            <span>View All Masterpieces</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
