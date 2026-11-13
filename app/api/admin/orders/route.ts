import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { sendOwnerOrderWhatsAppNotification } from '@/lib/whatsapp';
import { checkAdminSession } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const status = req.nextUrl.searchParams.get('status') || 'ALL';

    const where: Record<string, unknown> = {};
    if (status !== 'ALL') {
      where.orderStatus = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// Actions: retry-shiprocket or resend-whatsapp
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { action, orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (action === 'retry-shiprocket') {
      const adminSettings = await prisma.adminSettings.findUnique({ where: { id: 'default' } });
      const shiprocketCreds = {
        email: adminSettings?.shiprocketEmail,
        password: adminSettings?.shiprocketPassword,
        sandbox: adminSettings?.shiprocketSandbox ?? true,
      };

      const result = await createShiprocketOrder(
        {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
          shippingAddress: order.shippingAddress,
          city: order.city,
          state: order.state,
          pincode: order.pincode,
          totalAmount: order.totalAmount,
          subtotal: order.subtotal,
          paymentMethod: order.paymentMethod,
          items: order.items.map((it) => ({
            name: it.name,
            sku: it.sku,
            quantity: it.quantity,
            price: it.price,
          })),
        },
        shiprocketCreds
      );

      if (result.success) {
        const updated = await prisma.order.update({
          where: { id: order.id },
          data: {
            shiprocketOrderId: result.shiprocketOrderId,
            shipmentId: result.shipmentId,
            awbCode: result.awbCode,
            courierName: result.courierName,
            trackingUrl: result.trackingUrl,
            shiprocketStatus: 'SHIPMENT_CREATED',
            shiprocketError: result.error || null,
          },
        });
        const msg = result.awbCode
          ? `Shiprocket order synchronized with AWB: ${result.awbCode}`
          : `Shiprocket order #${result.shiprocketOrderId} created, but AWB is pending (${result.error || 'Check wallet balance/KYC in Shiprocket'}).`;
        return NextResponse.json({ success: true, message: msg, order: updated });
      } else {
        await prisma.order.update({
          where: { id: order.id },
          data: { shiprocketError: result.error || 'Retry failed' },
        });
        return NextResponse.json({ error: result.error || 'Shiprocket retry failed.' }, { status: 500 });
      }
    }

    if (action === 'resend-whatsapp') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const result = await sendOwnerOrderWhatsAppNotification({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        items: order.items.map((it) => ({
          name: it.name,
          sku: it.sku,
          quantity: it.quantity,
          price: it.price,
        })),
        adminOrderUrl: `${appUrl}/admin/orders/${order.orderNumber}`,
      });

      return NextResponse.json({
        success: result.success,
        message: result.success ? 'WhatsApp alert dispatched to owner.' : result.error,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
