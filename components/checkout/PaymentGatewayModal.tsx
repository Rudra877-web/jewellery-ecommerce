'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Building2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  Smartphone,
  AlertCircle,
} from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number; // in paise
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  onSuccess: (paymentId: string, signature?: string) => Promise<void>;
}

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  orderNumber,
  razorpayOrderId,
  amount,
  customerName,
  customerPhone,
  customerEmail,
  onSuccess,
}: PaymentGatewayModalProps) {
  const [activeMethod, setActiveMethod] = useState<'CARD' | 'UPI' | 'NETBANKING'>('CARD');

  // Card state
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardHolder, setCardHolder] = useState(customerName || 'Priya Sharma');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');

  // UPI state
  const [upiId, setUpiId] = useState(`${customerPhone || '9876543210'}@okhdfcbank`);
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm'>('gpay');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Processing state
  const [step, setStep] = useState<'INPUT' | 'OTP' | 'SUCCESS'>('INPUT');
  const [otp, setOtp] = useState('123456');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const totalRupees = (amount / 100).toLocaleString('en-IN');

  const handleCardPay = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (cardNumber.replace(/\s/g, '').length < 15) {
      setErrorMsg('Please enter a valid 16-digit card number.');
      return;
    }
    setStep('OTP');
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMsg('');

    try {
      const paymentId = `pay_sim_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
      await onSuccess(paymentId, 'simulated_signature_valid');
      setStep('SUCCESS');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Payment authorization failed');
      setProcessing(false);
    }
  };

  const handleDirectUpiOrBankPay = async () => {
    setProcessing(true);
    setErrorMsg('');

    try {
      // Simulate 1.2s gateway communication
      await new Promise((r) => setTimeout(r, 1200));
      const paymentId = `pay_sim_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
      await onSuccess(paymentId, 'simulated_signature_valid');
      setStep('SUCCESS');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Payment authorization failed');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-5 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#E6CA65]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-wide uppercase">
                  Razorpay Secure
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Instant Verification
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                Order #{orderNumber} • ₹{totalRupees}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={processing}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'INPUT' && (
            <div>
              {/* Method Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => setActiveMethod('CARD')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeMethod === 'CARD'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                  <span>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMethod('UPI')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeMethod === 'UPI'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>UPI & QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMethod('NETBANKING')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeMethod === 'NETBANKING'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* TAB 1: CARDS */}
              {activeMethod === 'CARD' && (
                <form onSubmit={handleCardPay} className="space-y-4">
                  {/* Visual Credit Card Preview */}
                  <div className="p-5 rounded-2xl bg-gradient-to-tr from-stone-900 via-stone-800 to-stone-950 text-white shadow-lg border border-[#D4AF37]/30 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-7 bg-amber-400/80 rounded-md border border-amber-300" />
                      <span className="font-serif italic font-bold tracking-widest text-[#E6CA65] text-sm">
                        GOLD PRIVILEGE
                      </span>
                    </div>
                    <div className="font-mono text-lg tracking-widest mb-3">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-end text-xs text-stone-300">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider block text-stone-400">Cardholder</span>
                        <span className="font-semibold uppercase">{cardHolder || 'CUSTOMER NAME'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider block text-stone-400">Expires</span>
                        <span className="font-mono">{expiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Card Number (Visa, Mastercard, RuPay)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4111 2222 3333 4444"
                      className="w-full text-xs font-mono py-2.5 px-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full text-xs font-mono py-2.5 px-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="888"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full text-xs font-mono py-2.5 px-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Proceed to 3D Secure OTP (₹{totalRupees})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* TAB 2: UPI */}
              {activeMethod === 'UPI' && (
                <div className="space-y-5 text-center">
                  {/* Scan QR simulation */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block">
                    <div className="w-40 h-40 bg-white p-3 rounded-xl border border-stone-300 mx-auto flex flex-col items-center justify-center shadow-inner relative">
                      <QrCode className="w-32 h-32 text-stone-900" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-stone-200 text-[#9A7B1C] font-serif font-bold text-xs">
                          JM
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-stone-600 mt-2 block">
                      Scan with any UPI App (GPay, PhonePe, Paytm)
                    </span>
                  </div>

                  <div className="text-xs text-stone-400 uppercase font-semibold">Or Enter UPI ID</div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. mobile@upi or username@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="flex-1 text-xs py-2.5 px-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      type="button"
                      disabled={processing}
                      onClick={handleDirectUpiOrBankPay}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      {processing ? 'Verifying...' : `Pay ₹${totalRupees}`}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {activeMethod === 'NETBANKING' && (
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-stone-700 block">
                    Select Your Bank:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                          selectedBank === b
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-stone-950 font-bold shadow-sm'
                            : 'border-stone-200 hover:border-stone-300 text-stone-700'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-[#D4AF37] mb-1" />
                        <span>{b}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleDirectUpiOrBankPay}
                    className="w-full py-3.5 bg-stone-900 hover:bg-[#9A7B1C] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md disabled:opacity-50 mt-4"
                  >
                    {processing ? 'Connecting to Bank...' : `Pay ₹${totalRupees} via ${selectedBank}`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: 3D SECURE OTP SIMULATOR */}
          {step === 'OTP' && (
            <form onSubmit={handleOtpVerify} className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Bank 3D Secure Authorization
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  A one-time security code has been sent to your registered mobile ending in{' '}
                  <strong className="text-stone-800">
                    {customerPhone.slice(-4) || '3210'}
                  </strong>
                </p>
              </div>

              <div className="max-w-xs mx-auto">
                <label className="block text-xs font-semibold text-stone-700 mb-1 text-left">
                  Enter 6-Digit Bank OTP
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 px-3 rounded-xl border-2 border-[#D4AF37] focus:outline-none bg-stone-50"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  (Test Sandbox OTP is pre-filled: 123456)
                </span>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full max-w-xs mx-auto py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <span>Authorizing ₹{totalRupees}...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Approve & Authorize Payment</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                Payment Authorized!
              </h3>
              <p className="text-xs text-stone-500">
                Generating hallmarked invoice, Shiprocket transit AWB, and dispatching your WhatsApp order confirmation...
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Trust Bar */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>256-Bit SSL Bank Grade Security</span>
          </div>
          <span>PCI-DSS Level 1 Certified</span>
        </div>
      </div>
    </div>
  );
}
