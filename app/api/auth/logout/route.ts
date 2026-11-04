import { NextResponse } from 'next/server';
import { CUSTOMER_COOKIE_NAME } from '@/lib/customer-auth';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Signed out successfully',
  });

  response.cookies.set({
    name: CUSTOMER_COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
