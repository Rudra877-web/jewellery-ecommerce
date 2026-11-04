import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signCustomerToken, CUSTOMER_COOKIE_NAME } from '@/lib/customer-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body; // identifier can be mobile number or email

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Please enter your mobile number/email and password.' },
        { status: 400 }
      );
    }

    const cleanInput = identifier.trim();
    const cleanPhone = cleanInput.replace(/\D/g, '').slice(-10);

    // Try finding by phone or by email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(cleanPhone.length === 10 ? [{ phone: cleanPhone }] : []),
          { email: cleanInput.toLowerCase() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this mobile number or email.' },
        { status: 401 }
      );
    }

    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Incorrect password. Please verify and try again.' },
        { status: 401 }
      );
    }

    const token = signCustomerToken({
      userId: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Signed in successfully!',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        pincode: user.pincode,
        city: user.city,
        state: user.state,
        role: user.role,
      },
    });

    response.cookies.set({
      name: CUSTOMER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: unknown) {
    console.error('[Login API Error]:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Login failed' },
      { status: 500 }
    );
  }
}
