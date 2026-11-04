import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customer-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    // Find orders belonging to userId or matching phone number
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: session.userId },
          { customerPhone: session.phone },
        ],
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (err: unknown) {
    console.error('[Customer Orders Error]:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
