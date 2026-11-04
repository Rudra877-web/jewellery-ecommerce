import { NextRequest, NextResponse } from 'next/server';
import { parseAndValidateCsv } from '@/lib/catalog-sync';

export async function POST(req: NextRequest) {
  try {
    const { csvContent } = await req.json();

    if (!csvContent || typeof csvContent !== 'string') {
      return NextResponse.json({ error: 'CSV content string is required' }, { status: 400 });
    }

    const result = parseAndValidateCsv(csvContent);

    return NextResponse.json({
      success: true,
      totalRows: result.totalRows,
      validCount: result.validRows.length,
      errorCount: result.errors.length,
      errors: result.errors,
      previewRows: result.validRows.slice(0, 10), // return up to 10 preview rows
      allValidRows: result.validRows,
    });
  } catch (err: unknown) {
    console.error('CSV validation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to validate CSV' },
      { status: 500 }
    );
  }
}
