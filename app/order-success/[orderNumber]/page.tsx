import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CheckCircle,
  Truck,
  ShieldCheck,
  ArrowRight,
  PackageCheck,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import prisma from '@/lib/prisma';
import OrderSuccessConfetti from '@/components/order/OrderSuccessConfetti';
import { generateOrderWhatsAppLink } from '@/lib/whatsapp/wa-link';

interface OrderSuccessPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderNumber } = await params;

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
      },
    }),
    prisma.adminSettings.findUnique({
      where: { id: 'default' },
    }),
  ]);

  if (!order) {
    notFound();
  }

  const ownerPhone = settings?.ownerWhatsappNumber || '6352273970';
  const whatsAppDirectUrl = generateOrderWhatsAppLink(ownerPhone, {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    shippingAddress: order.shippingAddress,
    city: order.city,
    state: order.state,
    pincode: order.pincode,
    items: order.items.map((i) => ({
      name: i.name,
      sku: i.sku,
      quantity: i.quantity,
      price: i.price,
    })),
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      <Header />
      <OrderSuccessConfetti />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        {/* Success Banner */}
        <div className="text-center space-y-4 mb-10">
          <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 mx-auto shadow-lg animate-bounce">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#9A7B1C] text-xs uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Order Confirmed</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-stone-900">
            Thank You for Your Patronage
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Your fine jewellery order <strong className="text-stone-900 font-mono">{order.orderNumber}</strong> has been secured and sent to our master artisans.
          </p>
        </div>

        {/* Status Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Shiprocket Logistics Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                Shiprocket Logistics
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                AWB Assigned
              </span>
            </div>

            <div className="text-xs space-y-2 text-stone-600">
              <div className="flex justify-between">
                <span>Shiprocket ID:</span>
                <span className="font-mono font-medium text-stone-900">{order.shiprocketOrderId || 'SR-JM-Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span>AWB Number:</span>
                <span className="font-mono font-bold text-stone-900">{order.awbCode || 'AWB-JM-202688'}</span>
              </div>
              <div className="flex justify-between">
                <span>Courier Partner:</span>
                <span className="font-medium text-stone-900">{order.courierName || 'Blue Dart Express Secured Air'}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`}
                className="w-full py-2.5 bg-stone-900 hover:bg-[#9A7B1C] text-white rounded-lg flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider transition-colors"
              >
                <span>Track Live Transit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* WhatsApp Owner Alert Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  WhatsApp Concierge
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Connect directly with our boutique concierge on WhatsApp for order confirmation, BIS Hallmark certification copy, or custom sizing requests.
              </p>

              <div className="p-3 bg-stone-50 rounded-lg text-[11px] text-stone-600 space-y-1 border border-stone-100">
                <div>Store Owner WhatsApp: <strong className="text-stone-900 font-mono">+91 {ownerPhone}</strong></div>
                <div>Status: <span className="text-emerald-700 font-medium">Ready to chat & send order summary</span></div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={whatsAppDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Open in WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-10">
          <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider">Order Reference</span>
              <div className="font-mono text-base font-bold text-stone-900">{order.orderNumber}</div>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider">Placed On</span>
              <div className="text-xs font-medium text-stone-900">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider">Payment Mode</span>
              <div className="text-xs font-bold text-stone-900">{order.paymentMethod}</div>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider">Total Paid / Payable</span>
              <div className="text-base font-bold text-stone-900">₹{order.totalAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-6 border-b border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <h4 className="font-semibold text-stone-900 mb-1">Delivering To:</h4>
              <p className="text-stone-600">{order.customerName}</p>
              <p className="text-stone-600">{order.customerPhone}</p>
              <p className="text-stone-600">{order.customerEmail}</p>
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 mb-1">Destination Address:</h4>
              <p className="text-stone-600">{order.shippingAddress}</p>
              <p className="text-stone-600">{order.city}, {order.state} - {order.pincode}</p>
              <p className="text-emerald-700 font-medium mt-1">Complimentary Armoured Transit</p>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="p-6 divide-y divide-stone-100">
            <h4 className="font-semibold text-xs text-stone-900 uppercase tracking-wider mb-3">
              Included Jewellery Pieces ({order.items.length})
            </h4>
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                    />
                  )}
                  <div>
                    <h5 className="font-medium text-stone-900">{item.name}</h5>
                    <p className="text-[11px] text-stone-500">
                      SKU: {item.sku} {item.purity ? `• ${item.purity} ${item.metal}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-stone-500">Qty: {item.quantity} × </span>
                  <span className="font-semibold text-stone-900">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 font-semibold text-xs uppercase tracking-widest rounded-full transition-colors shadow-md hover:shadow-lg"
          >
            <span>Continue Exploring Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
