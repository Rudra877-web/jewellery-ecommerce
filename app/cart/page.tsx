'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/lib/cart-store';
import { handleImageError, FALLBACK_JEWELLERY_IMAGE } from '@/lib/image-fallback';

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getSavings = useCartStore((s) => s.getSavings);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const subtotal = getSubtotal();
  const savings = getSavings();

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8 pb-4 border-b border-stone-200">
          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A7B1C]">
            Your Bag
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900">
            Shopping Cart ({items.length} items)
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-stone-900">Your bag is empty</h2>
            <p className="text-xs text-stone-500">
              Discover fine 22K Gold, Polki diamonds, and certified solitaires handcrafted to perfection.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex px-8 py-3 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 text-xs font-semibold uppercase tracking-widest rounded-full transition-colors shadow-md"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Cart Items List (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 divide-y divide-stone-100">
              {items.map((item) => (
                <div key={item.sku} className="py-5 flex flex-col sm:flex-row gap-5 first:pt-0 last:pb-0">
                  <img
                    src={item.image || FALLBACK_JEWELLERY_IMAGE}
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover bg-stone-50 border border-stone-200 flex-shrink-0"
                    onError={handleImageError}
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-serif text-lg font-medium text-stone-900 hover:text-[#9A7B1C] transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.sku)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-stone-500 mt-1 flex items-center gap-3">
                        <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-700 font-medium">
                          {item.purity} {item.metal}
                        </span>
                        <span>SKU: {item.sku}</span>
                        <span>Weight: {item.weightGrams}g</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="px-3 py-1 text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-stone-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="px-3 py-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-stone-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                        {item.mrp > item.price && (
                          <div className="text-xs text-stone-400 line-through">
                            ₹{(item.mrp * item.quantity).toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Summary (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5 sticky top-28">
              <h2 className="font-serif text-xl font-semibold text-stone-900 border-b border-stone-100 pb-3">
                Order Summary
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Insured Express Shipping</span>
                  <span className="text-emerald-700 font-semibold">Free (₹0)</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount Savings</span>
                    <span>-₹{savings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-stone-900 uppercase">Total Amount</span>
                  <span className="text-2xl font-bold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="space-y-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                  <span>100% BIS Hallmarked Pure Gold</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                  <span>Insured Blue Dart express delivery</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
