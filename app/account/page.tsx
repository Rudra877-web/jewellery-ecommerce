'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Package,
  MapPin,
  LogOut,
  Truck,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCustomerStore } from '@/lib/customer-store';
import { FALLBACK_JEWELLERY_IMAGE, handleImageError } from '@/lib/image-fallback';

interface OrderItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  metal?: string | null;
  purity?: string | null;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  awbCode?: string | null;
  courierName?: string | null;
  trackingUrl?: string | null;
  items: OrderItem[];
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, fetchUser, logout, setUser } = useCustomerStore();

  const [activeTab, setActiveTab] = useState<'ORDERS' | 'ADDRESS'>('ORDERS');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Address form
  const [addressForm, setAddressForm] = useState({
    name: '',
    email: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMsg, setAddressMsg] = useState('');
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    fetchUser().then((currentUser) => {
      if (!currentUser) {
        router.push('/login?redirect=/account');
      } else {
        setAddressForm({
          name: currentUser.name || '',
          email: currentUser.email || '',
          address: currentUser.address || '',
          pincode: currentUser.pincode || '',
          city: currentUser.city || '',
          state: currentUser.state || '',
        });

        // Fetch orders
        fetch('/api/customer/orders')
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.orders) {
              setOrders(data.orders);
            }
          })
          .catch((err) => console.error(err))
          .finally(() => setOrdersLoading(false));
      }
    });
  }, [fetchUser, router]);

  // Handle Address Save
  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressMsg('');
    setAddressError('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setAddressMsg('Delivery address updated successfully!');
      } else {
        setAddressError(data.error || 'Failed to update address.');
      }
    } catch {
      setAddressError('Network error while saving address.');
    } finally {
      setAddressSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 text-stone-400 text-xs">
          Loading your bespoke account...
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 sm:pb-10 w-full">
        {/* Profile Welcome Header */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#9A7B1C] font-serif text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">
                  {user.name}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-[#E6CA65] px-2.5 py-0.5 rounded-full">
                  Privileged Member
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  +91 {user.phone}
                </span>
                {user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    {user.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => logout()}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-rose-600 bg-stone-50 hover:bg-rose-50 border border-stone-200 rounded-xl transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop Catalogue</span>
            </Link>
          </div>
        </div>

        {/* Account Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation (3 cols) */}
          <div className="lg:col-span-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('ORDERS')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'ORDERS'
                  ? 'bg-stone-900 text-[#FAF8F5] shadow-sm'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#D4AF37]" />
                My Orders ({orders.length})
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ADDRESS')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'ADDRESS'
                  ? 'bg-stone-900 text-[#FAF8F5] shadow-sm'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                Saved Address
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Content Area (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* TAB: MY ORDERS */}
            {activeTab === 'ORDERS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h2 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#D4AF37]" />
                    Order History & Shipments
                  </h2>
                  <span className="text-xs text-stone-500">
                    {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Placed
                  </span>
                </div>

                {ordersLoading ? (
                  <div className="p-12 text-center text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">
                    Retrieving orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-stone-900">
                      No orders yet
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      You haven’t placed any jewellery orders yet. Discover our latest arrivals in 22K Hallmarked Gold and Solitaires.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex px-6 py-2.5 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4 hover:border-stone-300 transition-all"
                    >
                      {/* Order top bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-stone-900">
                              #{ord.orderNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                ord.paymentStatus === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ord.paymentMethod} • {ord.paymentStatus}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500 block mt-0.5">
                            Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-serif text-lg font-bold text-stone-900">
                            ₹{ord.totalAmount.toLocaleString('en-IN')}
                          </span>
                          <Link
                            href={`/track-order?orderNumber=${ord.orderNumber}`}
                            className="px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg flex items-center gap-1"
                          >
                            <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Track</span>
                          </Link>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ord.items.map((it) => (
                          <div
                            key={it.id}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50/70 border border-stone-100"
                          >
                            <img
                              src={it.image || FALLBACK_JEWELLERY_IMAGE}
                              alt={it.name}
                              className="w-12 h-12 rounded-lg object-cover bg-white border border-stone-200 flex-shrink-0"
                              onError={handleImageError}
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-semibold text-stone-900 truncate">
                                {it.name}
                              </h4>
                              <p className="text-[10px] text-stone-500">
                                Qty: {it.quantity} • ₹{it.price.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Logistics Tracking Info if available */}
                      {ord.awbCode && (
                        <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#FAF8F5] border border-[#D4AF37]/30 text-stone-700">
                          <span className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-[#D4AF37]" />
                            <span>Courier: <strong>{ord.courierName || 'Blue Dart Express'}</strong> | AWB: <code className="font-mono">{ord.awbCode}</code></span>
                          </span>
                          {ord.trackingUrl && (
                            <a
                              href={ord.trackingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#9A7B1C] font-semibold flex items-center gap-1 hover:underline"
                            >
                              Live Tracking <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: SAVED ADDRESS */}
            {activeTab === 'ADDRESS' && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" />
                    Default Delivery Address
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    This address will be automatically populated whenever you proceed to checkout.
                  </p>
                </div>

                {addressMsg && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{addressMsg}</span>
                  </div>
                )}

                {addressError && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {addressError}
                  </div>
                )}

                <form onSubmit={handleAddressSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="w-full text-xs py-2.5 px-3 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={addressForm.email}
                        onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                        className="w-full text-xs py-2.5 px-3 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Street Address & Flat / House No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 402, Golden Heritage Residency"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      className="w-full text-xs py-2.5 px-3 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        placeholder="110001"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        className="w-full text-xs py-2.5 px-3 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full text-xs py-2.5 px-3 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full text-xs py-2.5 px-3 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={addressSaving}
                    className="px-6 py-3 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm disabled:opacity-50"
                  >
                    {addressSaving ? 'Saving Changes...' : 'Save Default Address'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
