'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles, Check } from 'lucide-react';
import { ProductData } from '@/types/jewellery';
import { useCartStore } from '@/lib/cart-store';
import { handleImageError, FALLBACK_JEWELLERY_IMAGE } from '@/lib/image-fallback';

interface ProductCardProps {
  product: ProductData;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const imagesList = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? (product.images as string).split('|').map((s) => s.trim()).filter(Boolean)
    : [];

  const primaryImage = imagesList[0] || FALLBACK_JEWELLERY_IMAGE;
  const secondaryImage = imagesList[1] || primaryImage;

  const discountPercent =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      price: product.price,
      mrp: product.mrp,
      image: primaryImage,
      stock: product.stock,
      metal: product.metal,
      purity: product.purity,
      weightGrams: product.weightGrams,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-[#D4AF37]/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block relative">
        {/* Product Image with Alternate Image on Hover */}
        <div className="relative w-full aspect-square overflow-hidden bg-stone-50">
          <img
            src={isHovered ? secondaryImage : primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={handleImageError}
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
            {product.isBestseller && (
              <span className="inline-flex items-center gap-1 bg-[#1A1A1A] text-[#FAF8F5] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm border border-[#D4AF37]/40">
                <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                Best Seller
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Metal & Purity Badge */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="bg-white/90 backdrop-blur-md text-stone-800 text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-md border border-stone-200 shadow-sm">
              {product.purity} {product.metal}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] text-stone-600 mb-1">
              <span>SKU: {product.sku}</span>
              <span>{product.weightGrams}g</span>
            </div>
            <h3 className="font-serif text-base sm:text-lg font-medium text-stone-900 group-hover:text-[#9A7B1C] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </div>

          {/* Pricing & Add to Cart button */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div>
              <div className="text-base sm:text-lg font-bold text-stone-900">
                ₹{product.price.toLocaleString('en-IN')}
              </div>
              {product.mrp > product.price && (
                <div className="text-xs text-stone-500 line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={product.stock <= 0}
              className={`p-2.5 rounded-full flex items-center justify-center transition-all shadow-sm ${
                addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : product.stock <= 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-900 hover:bg-[#9A7B1C] text-white hover:scale-105'
              }`}
              title={product.stock <= 0 ? 'Out of Stock' : 'Add to Bag'}
              aria-label={`Add ${product.name} to cart`}
            >
              {addedAnimation ? (
                <Check className="w-4 h-4" />
              ) : (
                <ShoppingBag className="w-4 h-4 text-[#FAF8F5]" />
              )}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
