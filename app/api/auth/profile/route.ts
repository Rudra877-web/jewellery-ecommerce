import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customer-auth';
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, address, pincode, city, state } = body;

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(email !== undefined ? { email: email ? email.trim().toLowerCase() : null } : {}),
        ...(address !== undefined ? { address: address ? address.trim() : null } : {}),
        ...(pincode !== undefined ? { pincode: pincode ? pincode.trim() : null } : {}),
        ...(city !== undefined ? { city: city ? city.trim() : null } : {}),
        ...(state !== undefined ? { state: state ? state.trim() : null } : {}),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        pincode: true,
        city: true,
        state: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updated,
    });
  } catch (err: unknown) {
    console.error('[Update Profile Error]:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update profile' },
      { status: 500 }
    );
  }
}
