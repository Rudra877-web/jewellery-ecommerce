'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  MessageSquare,
  Truck,
  CreditCard,
  Save,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  ExternalLink,
  Info,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    ownerWhatsappNumber: '+919876543210',
    shiprocketEmail: '',
    shiprocketPassword: '',
    shiprocketSandbox: true,
    razorpayKeyId: 'rzp_test_jewellerymate',
    razorpayKeySecret: 'mock_razorpay_secret_key',
    whatsappToken: '',
    whatsappPhoneId: '',
    whatsappProvider: 'mock',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [testingShiprocket, setTestingShiprocket] = useState(false);
  const [shiprocketTestResult, setShiprocketTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const [testingWhatsapp, setTestingWhatsapp] = useState(false);
  const [whatsappTestResult, setWhatsappTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const testWhatsapp = async () => {
    setTestingWhatsapp(true);
    setWhatsappTestResult(null);
    try {
      const res = await fetch('/api/admin/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: form.ownerWhatsappNumber,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWhatsappTestResult({
          success: true,
          message: data.message || 'Meta WhatsApp test message sent successfully!',
        });
      } else {
        setWhatsappTestResult({
          success: false,
          message: data.error || 'Failed to dispatch Meta WhatsApp test message',
        });
      }
    } catch {
      setWhatsappTestResult({
        success: false,
        message: 'Could not connect to WhatsApp test endpoint. Check server logs.',
      });
    } finally {
      setTestingWhatsapp(false);
    }
  };

  const testShiprocket = async () => {
    setTestingShiprocket(true);
    setShiprocketTestResult(null);
    try {
      const res = await fetch('/api/admin/shiprocket/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.shiprocketEmail,
          password: form.shiprocketPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShiprocketTestResult({
          success: true,
          message: data.message || 'Shiprocket connected successfully!',
        });
      } else {
        setShiprocketTestResult({
          success: false,
          message: data.error || 'Authentication failed',
        });
      }
    } catch {
      setShiprocketTestResult({
        success: false,
        message: 'Could not connect to test endpoint. Check server logs.',
      });
    } finally {
      setTestingShiprocket(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) {
        setForm({
          ownerWhatsappNumber: data.settings.ownerWhatsappNumber || '+919876543210',
          shiprocketEmail: data.settings.shiprocketEmail || '',
          shiprocketPassword: data.settings.shiprocketPassword || '',
          shiprocketSandbox: data.settings.shiprocketSandbox ?? true,
          razorpayKeyId: data.settings.razorpayKeyId || 'rzp_test_jewellerymate',
          razorpayKeySecret: data.settings.razorpayKeySecret || '',
          whatsappToken: data.settings.whatsappToken || '',
          whatsappPhoneId: data.settings.whatsappPhoneId || '',
          whatsappProvider: data.settings.whatsappProvider || 'mock',
        });
      }
    } catch {}
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('API integration settings saved successfully.');
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch {
      setError('Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A7B1C]">
            Configurations
          </span>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">
            Integration Settings
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage owner WhatsApp alerts, Shiprocket logistics keys, and Razorpay payment credentials.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Owner WhatsApp Notifications */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <h2 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Meta WhatsApp Cloud API Integration
            </h2>
            <button
              type="button"
              disabled={testingWhatsapp}
              onClick={testWhatsapp}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-all disabled:opacity-50"
            >
              {testingWhatsapp ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Test WhatsApp...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Test WhatsApp Dispatch</span>
                </>
              )}
            </button>
          </div>

          {/* Meta WhatsApp Cloud API Info */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/90 text-emerald-950 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900">
                  Official Meta WhatsApp Cloud API (Free 1,000 conversations/month)
                </p>
                <p className="text-[11.5px] text-emerald-800/90 mt-1 leading-relaxed">
                  Direct server-to-server messaging with Meta Graph API. Order confirmations are dispatched using approved WhatsApp message templates (e.g. <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">order_confirmation</code>).
                </p>
                <div className="mt-2 text-[11px] text-emerald-900/90 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div>• Server-side token: <span className="font-mono font-semibold">WHATSAPP_ACCESS_TOKEN</span></div>
                  <div>• Phone ID: <span className="font-mono font-semibold">WHATSAPP_PHONE_NUMBER_ID</span></div>
                  <div>• Business Account: <span className="font-mono font-semibold">WHATSAPP_BUSINESS_ACCOUNT_ID</span></div>
                  <div>• Webhook Verify: <span className="font-mono font-semibold">WHATSAPP_VERIFY_TOKEN</span></div>
                </div>
              </div>
            </div>
          </div>

          {whatsappTestResult && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 ${
                whatsappTestResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {whatsappTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{whatsappTestResult.message}</div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Owner WhatsApp Mobile Number (with country code) *
              </label>
              <input
                type="text"
                required
                placeholder="+919876543210"
                value={form.ownerWhatsappNumber}
                onChange={(e) => setForm({ ...form, ownerWhatsappNumber: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-mono font-medium"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Store owner receives real-time WhatsApp order breakdown upon confirmed payment.
              </span>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                WhatsApp Delivery Provider
              </label>
              <select
                value={form.whatsappProvider}
                onChange={(e) => setForm({ ...form, whatsappProvider: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 bg-white font-medium"
              >
                <option value="meta">Meta WhatsApp Business Cloud API (Official Graph API)</option>
                <option value="direct">Direct 1-Click WhatsApp Link (Instant wa.me)</option>
                <option value="mock">Sandbox / Simulator (Internal Log)</option>
              </select>
            </div>

            {form.whatsappProvider === 'meta' && (
              <>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Meta Graph API Access Token
                  </label>
                  <input
                    type="password"
                    placeholder="EAAG... (or configured via WHATSAPP_ACCESS_TOKEN in .env)"
                    value={form.whatsappToken}
                    onChange={(e) => setForm({ ...form, whatsappToken: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 font-mono"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Permanent System User Token from Meta Business Manager &gt; System Users
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Meta Phone Number ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 104829384918234"
                    value={form.whatsappPhoneId}
                    onChange={(e) => setForm({ ...form, whatsappPhoneId: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 font-mono"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    From Meta WhatsApp App Dashboard &gt; API Setup &gt; Phone Number ID
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 2. Shiprocket Integration */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <h2 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#D4AF37]" />
              Shiprocket Logistics Integration
            </h2>
            <button
              type="button"
              disabled={testingShiprocket}
              onClick={testShiprocket}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#D4AF37] text-[#9A7B1C] hover:bg-[#D4AF37]/10 text-xs font-semibold transition-all disabled:opacity-50"
            >
              {testingShiprocket ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Test Connection</span>
                </>
              )}
            </button>
          </div>

          {/* Critical Explanation Notice for Shiprocket API */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 text-amber-950 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">
                  ⚠️ Important: Shiprocket requires a dedicated API User (Not your main dashboard login)
                </p>
                <p className="text-[11.5px] text-amber-800/90 mt-1 leading-relaxed">
                  Shiprocket API rejects your primary account login with <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">403 Invalid email and password combination</code>. You must create an API user inside Shiprocket:
                </p>
                <ol className="list-decimal ml-5 mt-1.5 space-y-1 text-[11px] text-amber-900/90">
                  <li>
                    Log in to your <b>Shiprocket Dashboard</b> (<a href="https://app.shiprocket.in" target="_blank" rel="noreferrer" className="underline font-semibold inline-flex items-center gap-0.5">app.shiprocket.in <ExternalLink className="w-3 h-3" /></a>).
                  </li>
                  <li>Go to <b>Settings ➔ API ➔ Configure</b> (or <b>+ Add New API User</b>).</li>
                  <li>
                    Enter a dedicated API User email (must be different from your primary dashboard email) and generate an API password.
                  </li>
                  <li>Copy and paste those <b>API User credentials</b> below.</li>
                </ol>
              </div>
            </div>
          </div>

          {shiprocketTestResult && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 ${
                shiprocketTestResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {shiprocketTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{shiprocketTestResult.message}</div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Shiprocket API User Email
              </label>
              <input
                type="email"
                placeholder="api-user@yourdomain.com"
                value={form.shiprocketEmail}
                onChange={(e) => setForm({ ...form, shiprocketEmail: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Dedicated email created under Shiprocket &gt; Settings &gt; API
              </span>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Shiprocket API User Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={form.shiprocketPassword}
                onChange={(e) => setForm({ ...form, shiprocketPassword: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-mono"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Password configured for this API user
              </span>
            </div>

            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.shiprocketSandbox}
                  onChange={(e) => setForm({ ...form, shiprocketSandbox: e.target.checked })}
                  className="w-4 h-4 text-[#D4AF37] rounded border-stone-300"
                />
                <div>
                  <span className="font-medium text-stone-800">
                    Enable Shiprocket Mock / Sandbox Mode
                  </span>
                  <p className="text-[11px] text-stone-400">
                    When enabled or when credentials are blank, orders generate simulated live AWBs (e.g. AWB-JM-202688) for risk-free testing.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* 3. Razorpay Payment Gateway */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-serif text-xl font-semibold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#D4AF37]" />
            Razorpay Online Payment Gateway
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Razorpay Key ID
              </label>
              <input
                type="text"
                placeholder="rzp_test_..."
                value={form.razorpayKeyId}
                onChange={(e) => setForm({ ...form, razorpayKeyId: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Razorpay Key Secret
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={form.razorpayKeySecret}
                onChange={(e) => setForm({ ...form, razorpayKeySecret: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Preferences...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
