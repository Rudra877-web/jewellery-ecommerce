import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (!q || !q.trim()) {
      return NextResponse.json({ error: 'Order reference or AWB is required' }, { status: 400 });
    }

    const searchTerm = q.trim();

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: searchTerm, mode: 'insensitive' } },
          { awbCode: { equals: searchTerm, mode: 'insensitive' } },
          { shiprocketOrderId: { equals: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: `No active shipment found for "${searchTerm}".` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        courierName: order.courierName,
        awbCode: order.awbCode,
        shiprocketOrderId: order.shiprocketOrderId,
        trackingUrl: order.trackingUrl,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((it) => ({
          name: it.name,
          sku: it.sku,
          quantity: it.quantity,
          price: it.price,
          image: it.image,
        })),
      },
    });
  } catch (err: unknown) {
    console.error('Order tracking API error:', err);
    return NextResponse.json({ error: 'Server error retrieving tracking info' }, { status: 500 });
  }
}
