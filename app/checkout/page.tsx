'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  Lock,
  Sparkles,
  User as UserIcon,
  LogIn,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/lib/cart-store';
import { useCustomerStore } from '@/lib/customer-store';
import { handleImageError, FALLBACK_JEWELLERY_IMAGE } from '@/lib/image-fallback';
import PaymentGatewayModal from '@/components/checkout/PaymentGatewayModal';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay?: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getSavings = useCartStore((s) => s.getSavings);

  const { user, fetchUser } = useCustomerStore();

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    shippingAddress: '',
    pincode: '',
    city: '',
    state: '',
    paymentMethod: 'COD' as 'COD' | 'RAZORPAY',
    saveAddressToProfile: true,
  });

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Online Payment Gateway Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentSessionData, setPaymentSessionData] = useState<{
    orderNumber: string;
    razorpayOrderId: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);
    fetchUser().then((currentUser) => {
      if (currentUser) {
        setForm((prev) => ({
          ...prev,
          customerName: currentUser.name || prev.customerName,
          customerPhone: currentUser.phone || prev.customerPhone,
          customerEmail: currentUser.email || prev.customerEmail,
          shippingAddress: currentUser.address || prev.shippingAddress,
          pincode: currentUser.pincode || prev.pincode,
          city: currentUser.city || prev.city,
          state: currentUser.state || prev.state,
        }));
      }
    });
  }, [fetchUser]);

  // Auto-fill City & State from 6-digit Indian PIN code
  useEffect(() => {
    const cleanPin = form.pincode.trim().replace(/\D/g, '');
    if (cleanPin.length === 6) {
      setPincodeLoading(true);
      fetch('/api/pincode/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: cleanPin }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setForm((prev) => ({
              ...prev,
              city: data.city || prev.city,
              state: data.state || prev.state,
            }));
          }
        })
        .catch(() => {})
        .finally(() => setPincodeLoading(false));
    }
  }, [form.pincode]);

  if (!isMounted) return null;

  const subtotal = getSubtotal();
  const savings = getSavings();
  const total = subtotal;

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your bag is empty.');
      return;
    }

    if (!form.customerName || !form.customerPhone || !form.shippingAddress || !form.pincode || !form.city || !form.state) {
      setErrorMessage('Please complete all required shipping details.');
      return;
    }

    setSubmitting(true);

    // 1. CASH ON DELIVERY (COD)
    if (form.paymentMethod === 'COD') {
      try {
        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            userId: user?.id || null,
            items: items.map((i) => ({
              sku: i.sku,
              quantity: i.quantity,
            })),
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          clearCart();
          window.location.href = data.redirectUrl;
        } else {
          setErrorMessage(data.error || 'Failed to place order. Please try again.');
          setSubmitting(false);
        }
      } catch {
        setErrorMessage('Network error while placing order. Please try again.');
        setSubmitting(false);
      }
      return;
    }

    // 2. ONLINE PAYMENT VIA RAZORPAY (CARDS, UPI, NETBANKING)
    try {
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ sku: i.sku, quantity: i.quantity })),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        setErrorMessage(orderData.error || 'Failed to initialize online payment gateway.');
        setSubmitting(false);
        return;
      }

      const { razorpayOrderId, amount, currency, keyId, isMock, orderNumber } = orderData;

      // Check if real Razorpay SDK can open
      if (!isMock && typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: keyId,
          amount: amount,
          currency: currency || 'INR',
          name: 'Jewellery Mate',
          description: `Order #${orderNumber}`,
          order_id: razorpayOrderId,
          prefill: {
            name: form.customerName,
            email: form.customerEmail,
            contact: form.customerPhone,
          },
          theme: {
            color: '#D4AF37',
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  orderNumber,
                  userId: user?.id || null,
                  ...form,
                  items: items.map((i) => ({ sku: i.sku, quantity: i.quantity })),
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                clearCart();
                window.location.href = verifyData.redirectUrl;
              } else {
                setErrorMessage(verifyData.error || 'Payment verification failed.');
                setSubmitting(false);
              }
            } catch {
              setErrorMessage('Error verifying payment.');
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
            },
          },
        });

        rzp.open();
        return;
      }

      // If in sandbox / mock mode OR Razorpay script not loaded, open our interactive gateway modal
      setPaymentSessionData({
        orderNumber,
        razorpayOrderId,
        amount,
      });
      setPaymentModalOpen(true);
      setSubmitting(false);
    } catch {
      setErrorMessage('Failed to connect to payment gateway. Please try again.');
      setSubmitting(false);
    }
  };

  // Callback when user completes payment in the modal
  const handleModalPaymentSuccess = async (paymentId: string, signature?: string) => {
    if (!paymentSessionData) return;

    const verifyRes = await fetch('/api/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpayOrderId: paymentSessionData.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature || 'simulated_signature_valid',
        orderNumber: paymentSessionData.orderNumber,
        userId: user?.id || null,
        ...form,
        items: items.map((i) => ({ sku: i.sku, quantity: i.quantity })),
      }),
    });

    const verifyData = await verifyRes.json();
    if (verifyRes.ok && verifyData.success) {
      clearCart();
      setTimeout(() => {
        router.push(verifyData.redirectUrl);
      }, 500);
    } else {
      throw new Error(verifyData.error || 'Payment verification failed');
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">Your bag is empty</h1>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Explore our handcrafted collections of 22K Gold, uncut Polki, and certified solitaires.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex px-8 py-3 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 text-xs font-semibold uppercase tracking-widest rounded-full transition-colors shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Checkout Breadcrumb */}
        <div className="mb-6 flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A7B1C]">
              Secure Checkout
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900">
              Shipping & Payment
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>

        {/* Customer Login Notice / Status Banner */}
        {user ? (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  Logged in as {user.name} (+91 {user.phone})
                </span>
                <span className="text-[11px] text-stone-600">
                  Your saved delivery address has been automatically applied below.
                </span>
              </div>
            </div>
            <Link
              href="/account"
              className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-950 whitespace-nowrap"
            >
              View Account
            </Link>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-2xl bg-[#FAF8F5] border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#9A7B1C] flex-shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  Already have an account with us?
                </span>
                <span className="text-[11px] text-stone-600">
                  Sign in for instant 1-click address autofill and order history tracking.
                </span>
              </div>
            </div>
            <Link
              href="/login?redirect=/checkout"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-[#9A7B1C] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all self-start sm:self-auto shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Customer Sign In</span>
            </Link>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Form Fields (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Customer Contact */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-semibold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-sans font-bold">1</span>
                Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full text-xs py-2.5 px-3 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full text-xs py-2.5 px-3 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Email Address (for order & invoice dispatch)
                  </label>
                  <input
                    type="email"
                    placeholder="priya.sharma@example.com"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    className="w-full text-xs py-2.5 px-3 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address with Pincode auto-fill */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-semibold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-sans font-bold">2</span>
                Shipping Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Flat / House No. & Building Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Golden Heights"
                    value={form.shippingAddress}
                    onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                    className="w-full text-xs py-2.5 px-3 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center justify-between">
                      <span>PIN Code *</span>
                      {pincodeLoading && <span className="text-[10px] text-[#9A7B1C]">Resolving...</span>}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="110001"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      className="w-full text-xs py-2.5 px-3 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full text-xs py-2.5 px-3 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37] bg-stone-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full text-xs py-2.5 px-3 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37] bg-stone-50"
                    />
                  </div>
                </div>

                {/* Save address checkbox for logged in user */}
                {user && (
                  <label className="flex items-center gap-2 pt-2 cursor-pointer text-xs text-stone-700">
                    <input
                      type="checkbox"
                      checked={form.saveAddressToProfile}
                      onChange={(e) => setForm({ ...form, saveAddressToProfile: e.target.checked })}
                      className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <span>Save / Update this as my default shipping address</span>
                  </label>
                )}

                <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg text-[11px] text-stone-600 border border-stone-200">
                  <Truck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                  <span>Blue Dart Express Insured Delivery: Estimated 2-4 business days upon dispatch.</span>
                </div>
              </div>
            </div>

            {/* 3. Payment Method: COD vs Razorpay */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-semibold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-sans font-bold">3</span>
                Payment Options
              </h2>

              <div className="space-y-3">
                {/* Online Payment via Razorpay */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.paymentMethod === 'RAZORPAY'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={form.paymentMethod === 'RAZORPAY'}
                    onChange={() => setForm({ ...form, paymentMethod: 'RAZORPAY' })}
                    className="mt-0.5 text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                        Online Payment (Razorpay Cards, UPI, NetBanking)
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Pay securely via Credit/Debit Cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), and Net Banking.
                    </p>
                  </div>
                </label>

                {/* Cash On Delivery */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.paymentMethod === 'COD'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={form.paymentMethod === 'COD'}
                    onChange={() => setForm({ ...form, paymentMethod: 'COD' })}
                    className="mt-0.5 text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full">
                        Zero Advance Needed
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Pay securely with cash or UPI QR code at your doorstep upon receiving your sealed jewellery parcel.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5 sticky top-28">
              <h2 className="font-serif text-xl font-semibold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-stone-500 font-sans font-normal">{items.length} items</span>
              </h2>

              {/* Items List */}
              <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.sku} className="py-3 flex gap-3">
                    <img
                      src={item.image || FALLBACK_JEWELLERY_IMAGE}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover bg-stone-50 border border-stone-200 flex-shrink-0"
                      onError={handleImageError}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-stone-900 truncate">{item.name}</h4>
                      <p className="text-[10px] text-stone-500">
                        SKU: {item.sku} • {item.purity} {item.metal}
                      </p>
                      <div className="flex justify-between items-center mt-1 text-xs">
                        <span className="text-stone-500">Qty: {item.quantity}</span>
                        <span className="font-semibold text-stone-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-stone-200 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Shiprocket Insured Transit</span>
                  <span className="text-emerald-700 font-semibold">Free (₹0)</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount Savings</span>
                    <span>-₹{savings.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                    Total Payable
                  </span>
                  <span className="text-2xl font-bold text-stone-900 font-sans">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-xl hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Securing Order & Payment...</span>
                ) : (
                  <>
                    <span>
                      {form.paymentMethod === 'RAZORPAY' ? 'Pay Online' : 'Place Order'} (₹{total.toLocaleString('en-IN')})
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Trust assurances */}
              <div className="space-y-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                  <span>100% BIS Hallmarked & Authenticity Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                  <span>Instant WhatsApp confirmation sent upon order verification</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Online Card / UPI Gateway Modal */}
      {paymentSessionData && (
        <PaymentGatewayModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          orderNumber={paymentSessionData.orderNumber}
          razorpayOrderId={paymentSessionData.razorpayOrderId}
          amount={paymentSessionData.amount}
          customerName={form.customerName}
          customerPhone={form.customerPhone}
          customerEmail={form.customerEmail}
          onSuccess={handleModalPaymentSuccess}
        />
      )}

      <Footer />
    </div>
  );
}
