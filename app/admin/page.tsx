import React from 'react';
import Link from 'next/link';
import {
  Gem,
  ShoppingBag,
  IndianRupee,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet,
  Truck,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { checkAdminSession } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    redirect('/admin/login');
  }

  // Aggregate Metrics
  const [
    totalProducts,
    activeProducts,
    totalOrders,
    ordersAggregation,
    recentOrders,
    syncConfig,
    recentLogs,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
    prisma.syncConfig.findUnique({ where: { id: 'default' } }),
    prisma.syncLog.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalRevenue = ordersAggregation._sum.totalAmount || 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A7B1C]">
            Overview & Telemetry
          </span>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">
            Jewellery Mate Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/sync"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-[#9A7B1C] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sheet Auto-Sync</span>
          </Link>
          <Link
            href="/admin/import"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV Import</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Total Sales Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 font-sans">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-stone-500">Across prepaid & verified COD orders</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Orders Received</span>
            <div className="p-2 rounded-lg bg-amber-50 text-[#D4AF37]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900">{totalOrders}</div>
          <p className="text-[11px] text-stone-500">Automated Shiprocket AWB dispatch</p>
        </div>

        {/* Total Catalog Products */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Catalog Items</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Gem className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900">{activeProducts} Active</div>
          <p className="text-[11px] text-stone-500">{totalProducts} total registered SKUs</p>
        </div>

        {/* Google Sheet Sync Status */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Catalog Sync Status</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-stone-900 flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                syncConfig?.lastSyncStatus === 'SUCCESS'
                  ? 'bg-emerald-500'
                  : syncConfig?.lastSyncStatus === 'FAILED'
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
            />
            <span>{syncConfig?.lastSyncStatus || 'READY'}</span>
          </div>
          <p className="text-[11px] text-stone-500 truncate">
            {syncConfig?.lastSyncMessage || 'Sync schedule: every 15 min'}
          </p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            Recent Customer Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-[#9A7B1C] hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500">
            No orders placed yet. Orders placed on the storefront will appear here instantly.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-100">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Shiprocket AWB</th>
                  <th className="p-4">WhatsApp Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/50">
                    <td className="p-4 font-mono font-bold text-stone-900">{ord.orderNumber}</td>
                    <td className="p-4">
                      <div className="font-medium text-stone-900">{ord.customerName}</div>
                      <div className="text-[11px] text-stone-500">{ord.city}, {ord.pincode}</div>
                    </td>
                    <td className="p-4 font-medium text-stone-700">{ord.items.length} items</td>
                    <td className="p-4 font-bold text-stone-900">₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800">
                        {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4">
                      {ord.awbCode ? (
                        <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {ord.awbCode}
                        </span>
                      ) : (
                        <span className="text-stone-400 italic">Pending</span>
                      )}
                    </td>
                    <td className="p-4">
                      {ord.whatsappSent ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          ✓ Sent
                        </span>
                      ) : (
                        <span className="text-rose-600 font-medium">Failed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Catalog Sync Logs */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h2 className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
            Recent Import & Sync Activity
          </h2>
          <Link
            href="/admin/sync"
            className="text-xs text-[#9A7B1C] hover:underline font-semibold"
          >
            Configure Sync Engine →
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-stone-500">No sync logs recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-stone-900 uppercase tracking-wide mr-2">
                    {log.type}
                  </span>
                  <span className="text-stone-500">Source: {log.source}</span>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-emerald-700 font-semibold">{log.successCount} Success</span>
                  {log.errorCount > 0 && (
                    <span className="text-rose-600 font-semibold">{log.errorCount} Failed</span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'PARTIAL'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
