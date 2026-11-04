import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signCustomerToken, CUSTOMER_COOKIE_NAME } from '@/lib/customer-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, password, email, address, pincode, city, state } = body;

    // Validate name
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter a valid full name.' }, { status: 400 });
    }

    // Validate 10-digit Indian mobile number
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
    }

    // Validate password
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Check if phone already registered
    const existingPhone = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });
    if (existingPhone) {
      return NextResponse.json(
        { error: 'An account with this mobile number already exists. Please sign in.' },
        { status: 400 }
      );
    }

    // Check optional email uniqueness
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : null;
    if (cleanEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: 'An account with this email address already exists.' },
          { status: 400 }
        );
      }
    }

    const { hash } = hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        passwordHash: hash,
        address: address?.trim() || null,
        pincode: pincode?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        role: 'CUSTOMER',
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
        createdAt: true,
      },
    });

    const token = signCustomerToken({
      userId: newUser.id,
      phone: newUser.phone,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: newUser,
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
    console.error('[Register API Error]:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
