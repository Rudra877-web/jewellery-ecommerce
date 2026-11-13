import { NextRequest, NextResponse } from 'next/server';
import { executeGoogleSheetSync } from '@/lib/catalog-sync';
import { checkAdminSession } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

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
      { success: false, error: err instanceof Error ? err.message : 'Sync execution failed' },
      { status: 400 }
    );
  }
}
