'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Truck,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { handleImageError, FALLBACK_JEWELLERY_IMAGE } from '@/lib/image-fallback';
import { generateOrderWhatsAppLink, generateCustomerUpdateWhatsAppLink } from '@/lib/whatsapp/wa-link';

interface OrderItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  metal?: string;
  purity?: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shiprocketOrderId?: string;
  shipmentId?: string;
  awbCode?: string;
  courierName?: string;
  trackingUrl?: string;
  shiprocketError?: string;
  whatsappSent: boolean;
  whatsappError?: string;
  whatsappRetryCount: number;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('6352273970');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${statusFilter}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.ownerWhatsappNumber) {
          setOwnerPhone(d.settings.ownerWhatsappNumber);
        }
      })
      .catch(() => {});
  }, [statusFilter]);

  const handleAction = async (action: 'retry-shiprocket' | 'resend-whatsapp', orderId: string) => {
    setActionLoading(`${action}-${orderId}`);
    setFeedback('');

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, orderId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback(data.message || 'Action executed successfully.');
        fetchOrders();
      } else {
        alert(data.error || 'Action failed');
      }
    } catch {
      alert('Network error executing action');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A7B1C]">
            Fulfillment & Logistics
          </span>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">
            Orders & Shipments ({orders.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track customer orders, monitor Shiprocket AWB creation, and verify owner WhatsApp alerts.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 shadow-sm self-start sm:self-auto text-xs font-medium">
          {['ALL', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === st
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-xs text-stone-400 border border-stone-200">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-xs text-stone-500 border border-stone-200">
            No orders match this status.
          </div>
        ) : (
          orders.map((ord) => {
            const isExpanded = expandedOrderId === ord.id;
            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
              >
                {/* Main Order Row Header */}
                <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="font-mono text-base font-bold text-stone-900">
                        {ord.orderNumber}
                      </span>
                      <div className="text-[11px] text-stone-500">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    <div className="hidden sm:block pl-4 border-l border-stone-200">
                      <div className="text-xs font-semibold text-stone-900">{ord.customerName}</div>
                      <div className="text-[11px] text-stone-500">{ord.customerPhone} • {ord.city}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Amount */}
                    <div className="text-right mr-2">
                      <div className="text-sm font-bold text-stone-900">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-stone-500 uppercase">{ord.paymentMethod}</div>
                    </div>

                    {/* Shiprocket Badge */}
                    <div>
                      {ord.awbCode ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                          <Truck className="w-3 h-3 text-emerald-600" />
                          AWB: {ord.awbCode}
                        </span>
                      ) : ord.shiprocketOrderId ? (
                        <span
                          className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200"
                          title={ord.shiprocketError || 'Shiprocket order registered. AWB pending courier allocation or wallet recharge.'}
                        >
                          <Truck className="w-3 h-3 text-amber-600" />
                          SR #{ord.shiprocketOrderId} (AWB Pending)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-stone-200">
                          Shiprocket Pending
                        </span>
                      )}
                    </div>

                    {/* WhatsApp Status Badge */}
                    <div>
                      {ord.whatsappSent ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          WhatsApp Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          WhatsApp Failed
                        </span>
                      )}
                    </div>

                    {/* Expand Button */}
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                      className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                      aria-label="Expand order details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="p-6 bg-stone-50/70 border-t border-stone-100 space-y-6 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Customer Details */}
                      <div className="space-y-1.5">
                        <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                          Customer & Delivery Address
                        </h4>
                        <p className="text-stone-800 font-medium">{ord.customerName}</p>
                        <p className="text-stone-600">{ord.customerPhone}</p>
                        <p className="text-stone-600">{ord.customerEmail}</p>
                        <p className="text-stone-700 pt-1">
                          {ord.shippingAddress}, {ord.city}, {ord.state} - {ord.pincode}
                        </p>
                      </div>

                      {/* Logistics Info */}
                      <div className="space-y-1.5">
                        <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                          Shiprocket Details
                        </h4>
                        <p className="text-stone-600">
                          Shiprocket Order ID: <strong>{ord.shiprocketOrderId || 'None'}</strong>
                        </p>
                        <p className="text-stone-600">
                          Shipment ID: <strong>{ord.shipmentId || 'None'}</strong>
                        </p>
                        <p className="text-stone-600">
                          AWB Code: <strong>{ord.awbCode || 'Unassigned'}</strong>
                        </p>
                        <p className="text-stone-600">
                          Courier: <strong>{ord.courierName || 'Blue Dart Express Secured'}</strong>
                        </p>
                        {ord.shiprocketError && (
                          <p className="text-rose-600 text-[11px] font-medium">
                            Error: {ord.shiprocketError}
                          </p>
                        )}
                      </div>

                      {/* Integration Actions */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                          Automation Actions
                        </h4>
                        <div className="space-y-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleAction('retry-shiprocket', ord.id)}
                            disabled={actionLoading === `retry-shiprocket-${ord.id}`}
                            className="w-full py-2 px-3 bg-stone-900 hover:bg-[#9A7B1C] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry Shiprocket Order</span>
                          </button>

                          {/* 1-Click Direct WhatsApp to Customer */}
                          <a
                            href={generateCustomerUpdateWhatsAppLink(ord.customerPhone, {
                              orderNumber: ord.orderNumber,
                              customerName: ord.customerName,
                              awbCode: ord.awbCode,
                              courierName: ord.courierName,
                              trackingUrl: ord.trackingUrl,
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm text-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-current" />
                            <span>WhatsApp to Customer</span>
                          </a>

                          {/* 1-Click Direct WhatsApp to Owner */}
                          <a
                            href={generateOrderWhatsAppLink(ownerPhone, {
                              orderNumber: ord.orderNumber,
                              customerName: ord.customerName,
                              customerPhone: ord.customerPhone,
                              totalAmount: ord.totalAmount,
                              paymentMethod: ord.paymentMethod,
                              shippingAddress: ord.shippingAddress,
                              city: ord.city,
                              state: ord.state,
                              pincode: ord.pincode,
                              items: ord.items,
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors border border-stone-200 text-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Open in Owner WhatsApp</span>
                          </a>

                          {/* Automated API Resend */}
                          <button
                            type="button"
                            onClick={() => handleAction('resend-whatsapp', ord.id)}
                            disabled={actionLoading === `resend-whatsapp-${ord.id}`}
                            className="w-full py-1.5 px-3 bg-stone-800 hover:bg-stone-900 text-stone-300 text-[11px] rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Trigger Auto-API Alert</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="pt-3 border-t border-stone-200">
                      <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] mb-3">
                        Included Jewellery Items ({ord.items.length})
                      </h4>
                      <div className="divide-y divide-stone-200/60 bg-white rounded-xl border border-stone-200 p-2">
                        {ord.items.map((it) => (
                          <div key={it.id} className="py-2.5 px-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={it.image || FALLBACK_JEWELLERY_IMAGE}
                                alt={it.name}
                                className="w-10 h-10 object-cover rounded-lg border border-stone-200"
                                onError={handleImageError}
                              />
                              <div>
                                <span className="font-medium text-stone-900">{it.name}</span>
                                <span className="text-[11px] text-stone-500 block">
                                  SKU: {it.sku} {it.purity ? `• ${it.purity} ${it.metal}` : ''}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-stone-500">Qty: {it.quantity} × </span>
                              <span className="font-semibold text-stone-900">
                                ₹{it.price.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
