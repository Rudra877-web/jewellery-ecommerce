'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Truck,
  Search,
  CheckCircle,
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { handleImageError, FALLBACK_JEWELLERY_IMAGE } from '@/lib/image-fallback';

interface TrackedOrder {
  orderNumber: string;
  customerName: string;
  city: string;
  state: string;
  pincode: string;
  totalAmount: number;
  orderStatus: string;
  courierName?: string;
  awbCode?: string;
  shiprocketOrderId?: string;
  trackingUrl?: string;
  createdAt: string;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('orderNumber') || searchParams.get('awb') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const performLookup = async (lookupTerm: string) => {
    if (!lookupTerm.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(lookupTerm.trim())}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.order);
      } else {
        setError(data.error || 'No shipment found for this order reference or AWB.');
      }
    } catch {
      setError('Unable to fetch tracking data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performLookup(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(query);
  };

  // Steps calculation
  const steps = [
    { label: 'Order Placed', done: true },
    { label: 'Artisan Verification', done: true },
    { label: 'Shiprocket Dispatched', done: Boolean(order?.awbCode) },
    { label: 'In Transit (Blue Dart)', done: Boolean(order?.awbCode) },
    { label: 'Delivered', done: order?.orderStatus === 'DELIVERED' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 sm:pb-12 w-full">
        {/* Title */}
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#9A7B1C] text-xs uppercase tracking-widest font-semibold">
            <Truck className="w-3.5 h-3.5" />
            <span>Shiprocket Real-Time Logistics</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900">
            Track Your Jewellery Transit
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Enter your Jewellery Mate Order ID (e.g. JM-2026-XXXX) or Blue Dart AWB number below.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Order ID (e.g. JM-2026-10492) or AWB code"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-xs sm:text-sm py-3 pl-10 pr-4 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37] font-medium"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8 py-3 bg-stone-900 hover:bg-[#9A7B1C] text-white text-xs uppercase tracking-widest font-semibold rounded-xl transition-colors disabled:opacity-40 shadow-sm"
            >
              {loading ? 'Locating...' : 'Track Transit'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Result Card */}
        {order && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden space-y-6 p-6">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider">Tracking Order</span>
                <div className="font-mono text-lg font-bold text-stone-900">{order.orderNumber}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider">Courier Partner</span>
                <div className="text-xs font-semibold text-stone-900">{order.courierName || 'Blue Dart Express Secured'}</div>
              </div>
            </div>

            {/* Visual Tracking Stepper */}
            <div className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {steps.map((st, i) => (
                  <div key={i} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        st.done
                          ? 'bg-[#D4AF37] text-stone-950 shadow-md ring-4 ring-[#D4AF37]/20'
                          : 'bg-stone-100 text-stone-400 border border-stone-200'
                      }`}
                    >
                      {st.done ? <CheckCircle className="w-5 h-5" /> : i + 1}
                    </div>
                    <span className={`text-[11px] font-medium ${st.done ? 'text-stone-900' : 'text-stone-400'}`}>
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipment Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-stone-50 rounded-xl text-xs text-stone-600 border border-stone-200/60">
              <div>
                <span className="text-stone-500 block text-[10px] uppercase">Blue Dart AWB</span>
                <span className="font-mono font-bold text-stone-900">{order.awbCode || 'Pending Assignment'}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px] uppercase">Destination City</span>
                <span className="font-semibold text-stone-900">{order.city}, {order.state} - {order.pincode}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px] uppercase">Status</span>
                <span className="text-emerald-700 font-bold uppercase tracking-wider">{order.orderStatus}</span>
              </div>
            </div>

            {/* Item List */}
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
                Items in This Shipment ({order.items.length})
              </h4>
              <div className="divide-y divide-stone-100">
                {order.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={it.image || FALLBACK_JEWELLERY_IMAGE}
                        alt={it.name}
                        className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                        onError={handleImageError}
                      />
                      <div>
                        <span className="font-medium text-stone-900">{it.name}</span>
                        <span className="text-[11px] text-stone-500 block">SKU: {it.sku}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-stone-900">Qty: {it.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-stone-400">Loading tracking portal...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
