'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function WhatsAppFloatingWidget() {
  const [phoneNumber, setPhoneNumber] = useState('6352273970');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.ownerWhatsappNumber) {
          setPhoneNumber(data.settings.ownerWhatsappNumber.replace(/\D/g, ''));
        }
      })
      .catch(() => {});
  }, []);

  if (!mounted) return null;

  const cleanPhone = phoneNumber.length === 10 ? `91${phoneNumber}` : phoneNumber;
  const message = encodeURIComponent(
    'Namaste Jewellery Mate! ✨ I am browsing your handcrafted fine jewellery collections and would love concierge assistance with designs and certification.'
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-3">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Jewellery Concierge on WhatsApp"
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/40 focus:outline-none focus:ring-4 focus:ring-emerald-300"
      >
        {/* Pulsing notification dot */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white" />
        </span>

        {/* WhatsApp Icon */}
        <MessageSquare className="w-5 h-5 fill-current" />

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90 text-emerald-100 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-[#FFE885]" />
            Live Concierge
          </span>
          <span className="text-xs font-bold leading-tight">Chat on WhatsApp</span>
        </div>
      </a>
    </div>
  );
}
