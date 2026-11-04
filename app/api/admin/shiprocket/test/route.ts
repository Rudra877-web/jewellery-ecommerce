import { NextRequest, NextResponse } from 'next/server';
import { verifyShiprocketCredentials } from '@/lib/shiprocket';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    let email: string | undefined;
    let password: string | undefined;

    try {
      const body = await req.json();
      email = body.email;
      password = body.password;
    } catch {
      // Empty body is acceptable
    }

    // Fallback to DB or env if not passed
    if (!email || !password) {
      try {
        const settings = await prisma.adminSettings.findUnique({ where: { id: 'default' } });
        email = email || settings?.shiprocketEmail || process.env.SHIPROCKET_EMAIL;
        password = password || settings?.shiprocketPassword || process.env.SHIPROCKET_PASSWORD;
      } catch {
        email = email || process.env.SHIPROCKET_EMAIL;
        password = password || process.env.SHIPROCKET_PASSWORD;
      }
    }

    const result = await verifyShiprocketCredentials(email, password);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Shiprocket verification failed',
      },
      { status: 500 }
    );
  }
}

