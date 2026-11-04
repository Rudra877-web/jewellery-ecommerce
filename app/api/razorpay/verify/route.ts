import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { sendOwnerOrderWhatsAppNotification } from '@/lib/whatsapp';
import { getCustomerSession } from '@/lib/customer-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    const body = await req.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderNumber,
      userId,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      pincode,
      city,
      state,
      saveAddressToProfile,
      items,
    } = body;

    // 1. Verify Signature
    const isValid = await verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment signature verification failed. Please contact support.' },
        { status: 400 }
      );
    }

    // 2. Fetch fresh prices and verify items
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

    const shippingFee = 0;
    const totalAmount = calculatedSubtotal + shippingFee;
    const resolvedUserId = userId || session?.userId || null;

    // 3. Create Order in Database as PAID
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
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PAID',
        razorpayOrderId,
        razorpayPaymentId,
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

    // Update user profile address if requested
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
        console.warn('Failed to update user address profile:', e);
      }
    }

    // 4. Inventory deduction
    for (const vi of validatedItems) {
      await prisma.product.update({
        where: { id: vi.productId },
        data: {
          stock: { decrement: vi.quantity },
          unitsSold: { increment: vi.quantity },
        },
      });
    }

    // 5. Shiprocket Order dispatch
    const adminSettings = await prisma.adminSettings.findUnique({ where: { id: 'default' } });
    const shiprocketCreds = {
      email: adminSettings?.shiprocketEmail,
      password: adminSettings?.shiprocketPassword,
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

    // 6. Owner WhatsApp notification
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
    console.error('[Razorpay Verify Error]:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Payment verification failed' },
      { status: 500 }
    );
  }
}
