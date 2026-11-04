import Papa from 'papaparse';
import prisma from '@/lib/prisma';

export const FIXED_CSV_COLUMNS = [
  'sku',
  'name',
  'description',
  'category',
  'subcategory',
  'price',
  'mrp',
  'stock',
  'metal',
  'purity',
  'stone',
  'occasion',
  'gender',
  'weight_grams',
  'image_urls',
  'is_bestseller',
  'status',
] as const;

export interface CsvCatalogRow {
  sku: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  mrp: number;
  stock: number;
  metal: string;
  purity: string;
  stone: string;
  occasion: string;
  gender: string;
  weight_grams: number;
  image_urls: string;
  is_bestseller: boolean;
  status: string;
}

export interface RowValidationError {
  rowNumber: number;
  sku: string;
  errors: string[];
}

export interface CsvValidationResult {
  validRows: CsvCatalogRow[];
  errors: RowValidationError[];
  totalRows: number;
}

/**
 * Generate a downloadable sample CSV template
 */
export function getSampleCsvTemplate(): string {
  const rows = [
    FIX_ARRAY_TO_CSV(FIXED_CSV_COLUMNS),
    [
      'JM-RNG-099',
      'Emerald Blossom Cocktail Ring',
      'Handmade 22K Gold ring centered with certified Colombian emerald and diamond halo.',
      'Rings',
      'Cocktail Rings',
      '45000',
      '52000',
      '10',
      'Gold',
      '22K',
      'Emerald',
      'Party',
      'Women',
      '6.4',
      '/products/gold-floral-ring.jpg',
      'TRUE',
      'ACTIVE',
    ].map(escapeCsvField).join(','),
    [
      'JM-NCK-099',
      'Navratna Pearl Heritage Choker',
      'Traditional 9 sacred gems with royal Basra pearls and uncut polki gemstones.',
      'Necklaces',
      'Chokers',
      '125000',
      '140000',
      '5',
      'Gold',
      '22K',
      'Ruby',
      'Bridal',
      'Women',
      '38.5',
      '/products/polki-emerald-choker.jpg',
      'FALSE',
      'ACTIVE',
    ].map(escapeCsvField).join(','),
    [
      'JM-EAR-099',
      'Chandbali Polki Jadau Earrings',
      'Heritage Kundan and uncut Polki chandeliers suspended with cluster pearls and ruby drops.',
      'Earrings',
      'Jhumkas & Drops',
      '68000',
      '75000',
      '8',
      'Gold',
      '22K',
      'Polki',
      'Festive',
      'Women',
      '18.2',
      '/products/meenakari-chandbali.jpg',
      'TRUE',
      'ACTIVE',
    ].map(escapeCsvField).join(','),
    [
      'JM-BNG-099',
      'Royal Meenakari Peacock Gold Kada',
      'Solid 22K yellow gold bangle with vibrant red and green Banarasi meenakari enameling.',
      'Bangles & Bracelets',
      'Kadas',
      '95000',
      '108000',
      '6',
      'Gold',
      '22K',
      'None',
      'Bridal',
      'Women',
      '24.8',
      '/products/antique-gold-kadas.jpg',
      'FALSE',
      'ACTIVE',
    ].map(escapeCsvField).join(','),
    [
      'JM-SOL-099',
      'Imperial 1.5 Carat Solitaire Ring',
      'GIA Certified Round Brilliant cut VVS1 solitaire diamond mounted on 18K white gold cathedral band.',
      'Solitaires',
      'Solitaire Rings',
      '185000',
      '210000',
      '4',
      'White Gold',
      '18K',
      'Diamond',
      'Daily Wear',
      'Unisex',
      '4.2',
      '/products/solitaire-diamond-ring.jpg',
      'TRUE',
      'ACTIVE',
    ].map(escapeCsvField).join(','),
  ];
  return rows.join('\r\n');
}

function escapeCsvField(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function FIX_ARRAY_TO_CSV(arr: readonly string[]): string {
  return arr.join(',');
}

/**
 * Validate and parse CSV content
 */
export function parseAndValidateCsv(csvContent: string): CsvValidationResult {
  const parsed = Papa.parse<Record<string, string>>(csvContent.trim(), {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
  });

  const validRows: CsvCatalogRow[] = [];
  const errors: RowValidationError[] = [];

  const seenSkus = new Set<string>();

  parsed.data.forEach((raw, idx) => {
    const rowNum = idx + 2; // account for header line and 1-based index
    const rowErrors: string[] = [];

    const sku = (raw.sku || '').trim();
    const name = (raw.name || '').trim();
    const category = (raw.category || '').trim();
    const priceRaw = (raw.price || '').replace(/,/g, '').trim();
    const mrpRaw = (raw.mrp || '').replace(/,/g, '').trim();
    const stockRaw = (raw.stock || '10').trim();
    const weightRaw = (raw.weight_grams || raw.weight || '0').trim();

    if (!sku) {
      rowErrors.push('SKU is required');
    } else if (seenSkus.has(sku)) {
      rowErrors.push(`Duplicate SKU "${sku}" within the file`);
    } else {
      seenSkus.add(sku);
    }

    if (!name) rowErrors.push('Name is required');
    if (!category) rowErrors.push('Category is required');

    const price = parseFloat(priceRaw);
    if (isNaN(price) || price <= 0) {
      rowErrors.push('Price must be a positive number');
    }

    const mrp = parseFloat(mrpRaw);
    if (isNaN(mrp) || mrp < price) {
      rowErrors.push('MRP must be a valid number equal to or greater than Price');
    }

    const stock = parseInt(stockRaw, 10);
    if (isNaN(stock) || stock < 0) {
      rowErrors.push('Stock must be an integer >= 0');
    }

    const weightGrams = parseFloat(weightRaw);
    if (isNaN(weightGrams) || weightGrams < 0) {
      rowErrors.push('Weight (grams) must be a positive number');
    }

    const metal = (raw.metal || 'Gold').trim();
    const purity = (raw.purity || '22K').trim();
    const stone = (raw.stone || 'None').trim();
    const occasion = (raw.occasion || 'Festive').trim();
    const gender = (raw.gender || 'Women').trim();
    const isBestseller = ['true', '1', 'yes'].includes((raw.is_bestseller || '').toLowerCase());
    const status = (raw.status || 'ACTIVE').toUpperCase().trim();

    if (rowErrors.length > 0) {
      errors.push({
        rowNumber: rowNum,
        sku: sku || `Row #${rowNum}`,
        errors: rowErrors,
      });
    } else {
      validRows.push({
        sku,
        name,
        description: (raw.description || `${name} - Handcrafted jewellery`).trim(),
        category,
        subcategory: (raw.subcategory || '').trim() || undefined,
        price,
        mrp,
        stock,
        metal,
        purity,
        stone,
        occasion,
        gender,
        weight_grams: weightGrams,
        image_urls: (raw.image_urls || '/products/gold-floral-ring.jpg').trim(),
        is_bestseller: isBestseller,
        status: ['ACTIVE', 'INACTIVE', 'DRAFT'].includes(status) ? status : 'ACTIVE',
      });
    }
  });

  return {
    validRows,
    errors,
    totalRows: parsed.data.length,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Upsert catalog rows into PostgreSQL via Prisma
 */
export async function upsertCatalogRows(
  rows: CsvCatalogRow[],
  sourceType: 'CSV_IMPORT' | 'GOOGLE_SHEET_SYNC',
  sourceName: string
) {
  let successCount = 0;
  let failedCount = 0;
  const errorLogs: Array<{ sku: string; error: string }> = [];

  // 1. Preload / auto-create all unique categories in this batch
  const categoryCache = new Map<string, string>();
  const uniqueCategories = Array.from(new Set(rows.map((r) => r.category)));

  for (const catName of uniqueCategories) {
    const slug = slugify(catName);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      categoryCache.set(catName, existing.id);
    } else {
      const created = await prisma.category.create({
        data: {
          name: catName,
          slug,
          description: `Handcrafted ${catName} collection`,
          sortOrder: 10,
        },
      });
      categoryCache.set(catName, created.id);
    }
  }

  // 2. Upsert each row by SKU
  for (const row of rows) {
    try {
      const categoryId = categoryCache.get(row.category);
      if (!categoryId) {
        throw new Error(`Category "${row.category}" could not be resolved.`);
      }

      const slug = `${slugify(row.name)}-${row.sku.toLowerCase()}`;

      await prisma.product.upsert({
        where: { sku: row.sku },
        update: {
          name: row.name,
          slug,
          description: row.description,
          price: row.price,
          mrp: row.mrp,
          stock: row.stock,
          metal: row.metal,
          purity: row.purity,
          stone: row.stone,
          occasion: row.occasion,
          gender: row.gender,
          weightGrams: row.weight_grams,
          images: row.image_urls,
          isBestseller: row.is_bestseller,
          status: row.status,
          categoryId,
          subcategory: row.subcategory,
        },
        create: {
          sku: row.sku,
          name: row.name,
          slug,
          description: row.description,
          price: row.price,
          mrp: row.mrp,
          stock: row.stock,
          metal: row.metal,
          purity: row.purity,
          stone: row.stone,
          occasion: row.occasion,
          gender: row.gender,
          weightGrams: row.weight_grams,
          images: row.image_urls,
          isBestseller: row.is_bestseller,
          status: row.status,
          categoryId,
          subcategory: row.subcategory,
        },
      });

      successCount++;
    } catch (e: unknown) {
      failedCount++;
      errorLogs.push({
        sku: row.sku,
        error: e instanceof Error ? e.message : 'Database upsert error',
      });
    }
  }

  // 3. Record SyncLog
  await prisma.syncLog.create({
    data: {
      type: sourceType,
      source: sourceName,
      totalRows: rows.length,
      successCount,
      errorCount: failedCount,
      errorsJson: errorLogs.length > 0 ? JSON.stringify(errorLogs) : null,
      status: failedCount === 0 ? 'SUCCESS' : successCount > 0 ? 'PARTIAL' : 'FAILED',
    },
  });

  return {
    totalRows: rows.length,
    successCount,
    failedCount,
    errorLogs,
  };
}

/**
 * Normalize any Google Drive or Google Sheets link into a downloadable CSV URL
 */
export function normalizeGoogleSpreadsheetUrl(url: string): string {
  const trimmed = url.trim();

  // If already a direct CSV export / publish url
  if (trimmed.includes('output=csv') || trimmed.includes('format=csv')) {
    return trimmed;
  }

  // 1. Google Sheets "Publish to the web" URL format:
  // e.g. https://docs.google.com/spreadsheets/d/e/2PACX-1vQ.../pubhtml or /pub
  const publishedMatch = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (publishedMatch && publishedMatch[1]) {
    const pubId = publishedMatch[1];
    let gid = '0';
    const gidMatch = trimmed.match(/gid=([0-9]+)/);
    if (gidMatch && gidMatch[1]) gid = gidMatch[1];
    return `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?output=csv&gid=${gid}`;
  }

  // 2. Standard Google Sheets sharing URL:
  // e.g. https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
  const sheetMatch = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (sheetMatch && sheetMatch[1] && sheetMatch[1] !== 'e') {
    const docId = sheetMatch[1];
    let gid = '0';
    const gidMatch = trimmed.match(/gid=([0-9]+)/);
    if (gidMatch && gidMatch[1]) gid = gidMatch[1];
    return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;
  }

  // 3. Google Drive file link:
  // e.g. https://drive.google.com/file/d/FILE_ID/view
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }

  return trimmed;
}

/**
 * Execute Google Sheets / Drive sync
 */
export async function executeGoogleSheetSync(targetUrl?: string, deactivateMissing: boolean = false) {
  let url = targetUrl;
  if (!url) {
    const cfg = await prisma.syncConfig.findUnique({ where: { id: 'default' } });
    url = cfg?.sheetUrl;
    if (cfg) deactivateMissing = cfg.deactivateMissing;
  }

  if (!url) {
    throw new Error('No Google Sheet or Drive CSV link configured. Please enter a valid URL.');
  }

  // If user is running the built-in demo sheet or template, sync directly from internal catalog
  if (url.includes('demo-sheet') || url === 'demo') {
    const csvText = getSampleCsvTemplate();
    const validation = parseAndValidateCsv(csvText);
    const upsertResult = await upsertCatalogRows(validation.validRows, 'GOOGLE_SHEET_SYNC', 'Sample Demo Catalog Sheet');
    const summaryMsg = `Synced ${upsertResult.successCount} sample demo products successfully!`;
    await prisma.syncConfig.upsert({
      where: { id: 'default' },
      update: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'SUCCESS',
        lastSyncMessage: summaryMsg,
      },
      create: {
        id: 'default',
        sheetUrl: url,
        lastSyncAt: new Date(),
        lastSyncStatus: 'SUCCESS',
        lastSyncMessage: summaryMsg,
      },
    });
    return {
      success: true,
      message: summaryMsg,
      totalRows: validation.validRows.length,
      successCount: upsertResult.successCount,
      failedCount: upsertResult.failedCount,
      isDemo: true,
    };
  }

  const exportUrl = normalizeGoogleSpreadsheetUrl(url);

  // Update status to RUNNING
  await prisma.syncConfig.upsert({
    where: { id: 'default' },
    update: {
      lastSyncStatus: 'RUNNING',
      lastSyncMessage: `Fetching from ${exportUrl}...`,
    },
    create: {
      id: 'default',
      sheetUrl: url,
      lastSyncStatus: 'RUNNING',
    },
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(exportUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'JewelleryMate-Sync/1.0',
        Accept: 'text/csv,text/plain,*/*',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(
          `Google Sheet not found (HTTP 404). Please ensure the spreadsheet URL is correct and shared publicly ("Anyone with the link can view"), or published as CSV (File -> Share -> Publish to web -> CSV).`
        );
      }
      if (res.status === 403 || res.status === 401) {
        throw new Error(
          `Google Sheet access denied (HTTP ${res.status}). Please change sharing permissions to "Anyone with the link can view".`
        );
      }
      throw new Error(`Failed to download spreadsheet: HTTP ${res.status} ${res.statusText}`);
    }

    const csvText = await res.text();

    if (csvText.trim().startsWith('<!DOCTYPE html') || csvText.includes('<html')) {
      throw new Error(
        `Received HTML webpage instead of CSV. This happens when the Google Sheet is private. In your Google Sheet, go to Share -> General access -> select "Anyone with the link" (Viewer).`
      );
    }
    const validation = parseAndValidateCsv(csvText);

    if (validation.validRows.length === 0) {
      throw new Error(`No valid products found in CSV. ${validation.errors.length} rows had errors.`);
    }

    const upsertResult = await upsertCatalogRows(validation.validRows, 'GOOGLE_SHEET_SYNC', url);

    // If requested, mark SKUs not in the sheet as INACTIVE
    if (deactivateMissing) {
      const activeSkusInSheet = validation.validRows.map((r) => r.sku);
      await prisma.product.updateMany({
        where: {
          sku: { notIn: activeSkusInSheet },
          status: 'ACTIVE',
        },
        data: {
          status: 'INACTIVE',
        },
      });
    }

    const summaryMsg = `Synced ${upsertResult.successCount} products successfully (${upsertResult.failedCount} failed).`;
    await prisma.syncConfig.update({
      where: { id: 'default' },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'SUCCESS',
        lastSyncMessage: summaryMsg,
      },
    });

    return {
      success: true,
      message: summaryMsg,
      ...upsertResult,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown sync error';
    await prisma.syncConfig.update({
      where: { id: 'default' },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'FAILED',
        lastSyncMessage: msg,
      },
    });
    throw err;
  }
}
