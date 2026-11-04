import { NextResponse } from 'next/server';
import { getSampleCsvTemplate } from '@/lib/catalog-sync';

export async function GET() {
  const csvData = getSampleCsvTemplate();

  return new NextResponse(csvData, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="jewellery_mate_sample_template.csv"',
    },
  });
}
