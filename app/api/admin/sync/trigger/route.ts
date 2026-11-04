import { NextRequest, NextResponse } from 'next/server';
import { executeGoogleSheetSync } from '@/lib/catalog-sync';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sheetUrl, deactivateMissing } = body;

    const result = await executeGoogleSheetSync(sheetUrl, deactivateMissing);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: unknown) {
    console.error('Trigger sync error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync execution failed' },
      { status: 500 }
    );
  }
}
