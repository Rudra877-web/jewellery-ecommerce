import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/customer-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Also get order count
    const orderCount = await prisma.order.count({
      where: { userId: customer.id },
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        ...customer,
        orderCount,
      },
    });
  } catch (err: unknown) {
    console.error('[Me API Error]:', err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
