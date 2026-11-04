import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    // Verify prices from database
    const skus = items.map((i: { sku: string }) => i.sku);
    const dbProducts = await prisma.product.findMany({
      where: { sku: { in: skus } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.sku, p]));
    let calculatedSubtotal = 0;

    for (const item of items) {
      const dbProd = productMap.get(item.sku);
      if (!dbProd) {
        return NextResponse.json({ error: `Product SKU "${item.sku}" no longer exists.` }, { status: 400 });
      }
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      calculatedSubtotal += dbProd.price * qty;
    }

    const shippingFee = 0; // Complimentary insured transit
    const totalAmount = calculatedSubtotal + shippingFee;

    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `JM-2026-${randomDigits}`;

    const rzpOrder = await createRazorpayOrder({
      amountInRupees: totalAmount,
      orderNumber,
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      razorpayOrderId: rzpOrder.orderId,
      keyId: rzpOrder.keyId,
      isMock: rzpOrder.isMock,
    });
  } catch (err: unknown) {
    console.error('[Razorpay Create Order Error]:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}
