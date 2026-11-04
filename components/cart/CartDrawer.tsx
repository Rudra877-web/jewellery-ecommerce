'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { handleImageError, FALLBACK_JEWELLERY_IMAGE } from '@/lib/image-fallback';

export default function CartDrawer() {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getSavings = useCartStore((s) => s.getSavings);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isDrawerOpen) return null;

  const subtotal = getSubtotal();
  const savings = getSavings();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#9A7B1C]" />
              <h2 className="font-serif text-xl font-semibold text-stone-900 tracking-wide">
                Your Jewellery Bag ({items.length})
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-full transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body: Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-medium text-stone-800">Your bag is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs">
                  Discover exquisite pieces handcrafted in 22K Gold, natural diamonds, and uncut polki.
                </p>
                <button
                  onClick={closeDrawer}
                  className="mt-2 px-6 py-2.5 bg-stone-900 hover:bg-[#9A7B1C] text-white text-xs uppercase tracking-widest font-medium rounded-full transition-colors shadow-sm"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.sku} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 border border-stone-200">
                    <img
                      src={item.image || FALLBACK_JEWELLERY_IMAGE}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeDrawer}
                        className="text-sm font-medium text-stone-900 hover:text-[#9A7B1C] line-clamp-1 transition-colors"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.sku)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors ml-2"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                      <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-700 font-medium">
                        {item.purity} {item.metal}
                      </span>
                      <span>{item.weightGrams}g</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="px-2 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-semibold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="px-2 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200 disabled:opacity-30 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Price */}
                      <div className="text-right">
                        <span className="text-sm font-semibold text-stone-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        {item.mrp > item.price && (
                          <div className="text-[10px] text-stone-400 line-through">
                            ₹{(item.mrp * item.quantity).toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer (Summary & Checkout CTA) */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/80 space-y-3">
              {savings > 0 && (
                <div className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-md flex items-center justify-between border border-emerald-200">
                  <span>Your Total Savings:</span>
                  <span className="font-semibold">₹{savings.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-sm font-semibold text-stone-900">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Express Shipping</span>
                  <span className="text-emerald-700 font-medium">Free</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="w-full py-3.5 bg-stone-900 hover:bg-[#9A7B1C] text-white rounded-lg flex items-center justify-center gap-2 font-medium text-sm tracking-wider uppercase transition-colors shadow-md group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>100% Insured Delivery via Blue Dart Express</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
