import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminSession } from '@/lib/admin-auth';

export async function GET() {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const config = await prisma.syncConfig.findUnique({
      where: { id: 'default' },
    });
    return NextResponse.json({ success: true, config });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve sync configuration.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { sheetUrl, syncIntervalMinutes, deactivateMissing } = await req.json();

    const updated = await prisma.syncConfig.upsert({
      where: { id: 'default' },
      update: {
        sheetUrl: sheetUrl?.trim() || '',
        syncIntervalMinutes: parseInt(syncIntervalMinutes, 10) || 15,
        deactivateMissing: Boolean(deactivateMissing),
      },
      create: {
        id: 'default',
        sheetUrl: sheetUrl?.trim() || '',
        syncIntervalMinutes: parseInt(syncIntervalMinutes, 10) || 15,
        deactivateMissing: Boolean(deactivateMissing),
        lastSyncStatus: 'IDLE',
      },
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update config' },
      { status: 500 }
    );
  }
}
