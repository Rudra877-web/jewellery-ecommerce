import { NextRequest, NextResponse } from 'next/server';
import { executeGoogleSheetSync } from '@/lib/catalog-sync';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'jewellery_mate_cron_secret_2026';

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron request.' }, { status: 401 });
  }

  try {
    const result = await executeGoogleSheetSync();
    return NextResponse.json({ success: true, timestamp: new Date().toISOString(), result });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Cron sync execution error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
