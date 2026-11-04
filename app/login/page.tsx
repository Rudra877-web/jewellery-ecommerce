'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Phone,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCustomerStore } from '@/lib/customer-store';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const { user, fetchUser, setUser } = useCustomerStore();
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');
  const [registerPincode, setRegisterPincode] = useState('');
  const [registerCity, setRegisterCity] = useState('');
  const [registerState, setRegisterState] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchUser().then((loggedInUser) => {
      if (loggedInUser) {
        router.push(redirectUrl);
      }
    });
  }, [fetchUser, router, redirectUrl]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setSuccessMsg('Welcome back! Redirecting...');
        setTimeout(() => {
          router.push(redirectUrl);
        }, 600);
      } else {
        setErrorMsg(data.error || 'Failed to sign in. Please verify your credentials.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          phone: registerPhone,
          email: registerEmail,
          password: registerPassword,
          address: registerAddress,
          pincode: registerPincode,
          city: registerCity,
          state: registerState,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          router.push(redirectUrl);
        }, 700);
      } else {
        setErrorMsg(data.error || 'Failed to create account.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl border border-stone-200/80 shadow-xl overflow-hidden p-6 sm:p-10">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#9A7B1C] bg-[#FAF8F5] px-3.5 py-1.5 rounded-full border border-[#D4AF37]/30 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          Jewellery Mate Concierge
        </span>
        <h1 className="font-serif text-3xl font-semibold text-stone-900 tracking-tight">
          {tab === 'LOGIN' ? 'Sign In to Your Account' : 'Create an Account'}
        </h1>
        <p className="text-xs text-stone-500 mt-2">
          {tab === 'LOGIN'
            ? 'Access your orders, track shipments, and enjoy fast 1-click checkout.'
            : 'Join our bespoke collectors club for exclusive jewellery and order tracking.'}
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-stone-100 p-1.5 rounded-2xl mb-8">
        <button
          type="button"
          onClick={() => {
            setTab('LOGIN');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
            tab === 'LOGIN'
              ? 'bg-white text-stone-950 shadow-sm'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('REGISTER');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
            tab === 'REGISTER'
              ? 'bg-white text-stone-950 shadow-sm'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          New Customer
        </button>
      </div>

      {/* Alert Notices */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* LOGIN TAB */}
      {tab === 'LOGIN' && (
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Mobile Number or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. 9876543210 or name@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full text-xs py-3 pl-10 pr-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-stone-700">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs py-3 pl-10 pr-10 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-stone-900 hover:bg-[#9A7B1C] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In Securely</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* REGISTER TAB */}
      {tab === 'REGISTER' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
              />
              <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Email (Optional)
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="priya@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Create Password (min. 6 characters) *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Choose a strong password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="w-full text-xs py-2.5 pl-9 pr-9 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Optional Delivery Address */}
          <div className="pt-2 border-t border-stone-100">
            <span className="text-[11px] font-semibold text-stone-600 block mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              Default Delivery Address (Optional)
            </span>
            <input
              type="text"
              placeholder="Flat / House / Building / Street"
              value={registerAddress}
              onChange={(e) => setRegisterAddress(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37] mb-2"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Pincode"
                value={registerPincode}
                onChange={(e) => setRegisterPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-xs py-2 px-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
              />
              <input
                type="text"
                placeholder="City"
                value={registerCity}
                onChange={(e) => setRegisterCity(e.target.value)}
                className="w-full text-xs py-2 px-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
              />
              <input
                type="text"
                placeholder="State"
                value={registerState}
                onChange={(e) => setRegisterState(e.target.value)}
                className="w-full text-xs py-2 px-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Registering Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Security note & Admin Link */}
      <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col items-center gap-3 text-stone-400 text-xs">
        <div className="flex items-center gap-1.5 text-stone-500">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>Your personal data and payments are 100% encrypted & secure</span>
        </div>
        <div>
          Are you the store owner?{' '}
          <Link href="/admin/login" className="text-stone-700 underline hover:text-[#9A7B1C]">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <Suspense fallback={<div className="text-xs text-stone-400">Loading secure portal...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
