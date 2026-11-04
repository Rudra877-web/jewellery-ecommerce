import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PASSWORD, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }
}
