import { NextResponse } from 'next/server';
import { checkAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const authenticated = await checkAdminSession();
  return NextResponse.json({ authenticated });
}

