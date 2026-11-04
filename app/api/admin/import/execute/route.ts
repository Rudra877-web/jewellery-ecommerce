import { NextRequest, NextResponse } from 'next/server';
import { upsertCatalogRows, CsvCatalogRow } from '@/lib/catalog-sync';

export async function POST(req: NextRequest) {
  try {
    const { rows, filename } = await req.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No validated rows provided for import.' }, { status: 400 });
    }

    const sourceName = filename || 'Admin CSV Import';
    const result = await upsertCatalogRows(rows as CsvCatalogRow[], 'CSV_IMPORT', sourceName);

    return NextResponse.json({
      success: true,
      message: `Imported ${result.successCount} products successfully (${result.failedCount} errors).`,
      ...result,
    });
  } catch (err: unknown) {
    console.error('Import execution error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to execute import' },
      { status: 500 }
    );
  }
}
