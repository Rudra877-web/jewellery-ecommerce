'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles, Check, Heart, ShieldCheck } from 'lucide-react';
import { ProductData } from '@/types/jewellery';
import { useCartStore } from '@/lib/cart-store';
import { handleImageError, FALLBACK_JEWELLERY_IMAGE } from '@/lib/image-fallback';

interface ProductCardProps {
  product: ProductData;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('jm_wishlist');
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.includes(product.id)) {
          setIsWishlisted(true);
        }
      }
    } catch {}
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isWishlisted;
    setIsWishlisted(next);
    try {
      const stored = localStorage.getItem('jm_wishlist');
      const list: string[] = stored ? JSON.parse(stored) : [];
      const updated = next
        ? [...new Set([...list, product.id])]
        : list.filter((id) => id !== product.id);
      localStorage.setItem('jm_wishlist', JSON.stringify(updated));
    } catch {}
  };

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
      className="group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-stone-200/80 hover:border-[#D4AF37]/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Area */}
      <div className="relative w-full aspect-square overflow-hidden bg-stone-50">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered ? secondaryImage : primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={handleImageError}
          />
        </Link>

        {/* Badges Overlay (Top-Left) */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {product.isBestseller && (
            <span className="inline-flex items-center gap-1 bg-stone-950/90 backdrop-blur-sm text-[#FAF8F5] text-[8.5px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm border border-[#D4AF37]/50">
              <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
              Best Seller
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-emerald-700/95 backdrop-blur-sm text-white text-[8.5px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Heart Button (Top-Right) - Separated from Link */}
        <button
          type="button"
          onClick={toggleWishlist}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-20 p-1.5 sm:p-2 rounded-full transition-all duration-200 shadow-sm active:scale-75 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 scale-105 border border-rose-200'
              : 'bg-white/80 hover:bg-white text-stone-600 hover:text-rose-600 backdrop-blur-sm border border-stone-200/80'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Wishlisted' : 'Save piece'}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isWishlisted ? 'fill-rose-600 stroke-rose-600' : 'stroke-current'
            }`}
          />
        </button>

        {/* Metal & Purity Badge (Bottom-Left) */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10 pointer-events-none">
          <span className="bg-white/95 backdrop-blur-md text-stone-900 text-[8.5px] sm:text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded border border-[#D4AF37]/40 shadow-sm flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5 text-[#9A7B1C]" />
            {product.purity} {product.metal}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2">
        <div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500 mb-0.5">
            <span className="truncate max-w-[90px] sm:max-w-none">SKU: {product.sku}</span>
            <span className="font-medium text-stone-600">{product.weightGrams}g</span>
          </div>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-xs sm:text-base lg:text-lg font-medium text-stone-900 hover:text-[#9A7B1C] transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add to Cart button - Separated from Link */}
        <div className="pt-1.5 sm:pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
          <div className="min-w-0">
            <div className="text-sm sm:text-lg font-bold text-stone-900 truncate">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
            {product.mrp > product.price && (
              <div className="text-[10px] sm:text-xs text-stone-400 line-through truncate">
                ₹{product.mrp.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`p-2 sm:p-2.5 rounded-full flex items-center justify-center transition-all shadow-sm flex-shrink-0 active:scale-90 ${
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
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FAF8F5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
