import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { sendOwnerOrderWhatsAppNotification } from '@/lib/whatsapp';
import { getCustomerSession } from '@/lib/customer-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    const body = await req.json();
    const {
      userId,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      pincode,
      city,
      state,
      paymentMethod,
      saveAddressToProfile,
      items,
    } = body;

    const resolvedUserId = userId || session?.userId || null;

    // 1. Basic validation
    if (!customerName || !customerPhone || !shippingAddress || !pincode || !city || !state) {
      return NextResponse.json({ error: 'Please fill in all required shipping fields.' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    // 2. Fetch fresh prices and verify stock from DB
    const skus = items.map((i: { sku: string }) => i.sku);
    const dbProducts = await prisma.product.findMany({
      where: { sku: { in: skus } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.sku, p]));

    let calculatedSubtotal = 0;
    const validatedItems: Array<{
      productId: string;
      sku: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
      metal: string;
      purity: string;
    }> = [];

    for (const item of items) {
      const dbProd = productMap.get(item.sku);
      if (!dbProd) {
        return NextResponse.json({ error: `Product SKU "${item.sku}" no longer exists.` }, { status: 400 });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      calculatedSubtotal += dbProd.price * qty;

      const img = dbProd.images.split('|')[0] || '';
      validatedItems.push({
        productId: dbProd.id,
        sku: dbProd.sku,
        name: dbProd.name,
        price: dbProd.price,
        quantity: qty,
        image: img,
        metal: dbProd.metal,
        purity: dbProd.purity,
      });
    }

    const shippingFee = 0; // Complimentary insured transit
    const totalAmount = calculatedSubtotal + shippingFee;

    // 3. Generate unique order number (e.g. JM-2026-10492)
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `JM-2026-${randomDigits}`;

    const isCod = paymentMethod === 'COD';
    const paymentStatus = isCod ? 'PENDING' : 'PAID'; // In sandbox/mock, mark as paid or pending

    // 4. Create Order & OrderItems in Database
    const createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: resolvedUserId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: (customerEmail || `${customerPhone.trim()}@jewellerymate.com`).trim(),
        shippingAddress: shippingAddress.trim(),
        pincode: pincode.trim(),
        city: city.trim(),
        state: state.trim(),
        subtotal: calculatedSubtotal,
        shippingFee,
        discount: 0,
        totalAmount,
        paymentMethod: isCod ? 'COD' : 'RAZORPAY',
        paymentStatus,
        orderStatus: 'CONFIRMED',
        items: {
          create: validatedItems.map((vi) => ({
            productId: vi.productId,
            sku: vi.sku,
            name: vi.name,
            price: vi.price,
            quantity: vi.quantity,
            image: vi.image,
            metal: vi.metal,
            purity: vi.purity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // If customer is logged in and requested saving address, update profile
    if (resolvedUserId && saveAddressToProfile) {
      try {
        await prisma.user.update({
          where: { id: resolvedUserId },
          data: {
            address: shippingAddress.trim(),
            pincode: pincode.trim(),
            city: city.trim(),
            state: state.trim(),
          },
        });
      } catch (e) {
        console.warn('Failed to auto-save address to user profile:', e);
      }
    }

    // 5. Deduct inventory & increase unitsSold
    for (const vi of validatedItems) {
      await prisma.product.update({
        where: { id: vi.productId },
        data: {
          stock: { decrement: vi.quantity },
          unitsSold: { increment: vi.quantity },
        },
      });
    }

    // 6. Create Shiprocket Adhoc Order & Generate AWB
    let adminSettings = null;
    try {
      adminSettings = await prisma.adminSettings.findUnique({ where: { id: 'default' } });
    } catch (dbErr) {
      console.warn('[Orders Create]: Could not fetch admin settings from DB, using fallback env', dbErr);
    }

    const shiprocketCreds = {
      email: adminSettings?.shiprocketEmail || process.env.SHIPROCKET_EMAIL,
      password: adminSettings?.shiprocketPassword || process.env.SHIPROCKET_PASSWORD,
      sandbox: adminSettings?.shiprocketSandbox ?? true,
    };

    let shiprocketResult;
    try {
      shiprocketResult = await createShiprocketOrder(
        {
          orderNumber,
          customerName: createdOrder.customerName,
          customerPhone: createdOrder.customerPhone,
          customerEmail: createdOrder.customerEmail,
          shippingAddress: createdOrder.shippingAddress,
          city: createdOrder.city,
          state: createdOrder.state,
          pincode: createdOrder.pincode,
          totalAmount: createdOrder.totalAmount,
          subtotal: createdOrder.subtotal,
          paymentMethod: createdOrder.paymentMethod,
          items: validatedItems,
        },
        shiprocketCreds
      );

      if (shiprocketResult.success) {
        await prisma.order.update({
          where: { id: createdOrder.id },
          data: {
            shiprocketOrderId: shiprocketResult.shiprocketOrderId,
            shipmentId: shiprocketResult.shipmentId,
            awbCode: shiprocketResult.awbCode,
            courierName: shiprocketResult.courierName,
            trackingUrl: shiprocketResult.trackingUrl,
            shiprocketStatus: 'SHIPMENT_CREATED',
          },
        });
      }
    } catch (shipErr: unknown) {
      console.error('[Shiprocket Integration Error]:', shipErr);
      await prisma.order.update({
        where: { id: createdOrder.id },
        data: {
          shiprocketError: shipErr instanceof Error ? shipErr.message : 'Shiprocket order creation failed',
        },
      });
    }

    // 7. Dispatch instant Owner WhatsApp notification
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
      await sendOwnerOrderWhatsAppNotification({
        orderNumber,
        customerName: createdOrder.customerName,
        customerPhone: createdOrder.customerPhone,
        customerEmail: createdOrder.customerEmail,
        shippingAddress: createdOrder.shippingAddress,
        city: createdOrder.city,
        state: createdOrder.state,
        pincode: createdOrder.pincode,
        totalAmount: createdOrder.totalAmount,
        paymentMethod: createdOrder.paymentMethod,
        items: validatedItems,
        adminOrderUrl: `${appUrl}/admin/orders/${orderNumber}`,
      });
    } catch (waErr: unknown) {
      console.error('[WhatsApp Notification Error]:', waErr);
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId: createdOrder.id,
      shiprocket: shiprocketResult,
      redirectUrl: `/order-success/${orderNumber}`,
    });
  } catch (err: unknown) {
    console.error('Order creation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to place order' },
      { status: 500 }
    );
  }
}
