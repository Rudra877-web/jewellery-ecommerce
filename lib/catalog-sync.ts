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
  detectedHeaders?: string[];
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

function getRawField(raw: Record<string, string>, ...aliases: string[]): string {
  const rawKeys = Object.keys(raw);
  for (const alias of aliases) {
    const normalizedAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const key of rawKeys) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedKey === normalizedAlias) {
        const val = raw[key];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }
  return '';
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

  console.log('[CSV Parse Debug]: Detected Headers:', parsed.meta.fields);
  console.log('[CSV Parse Debug]: Total Parsed Rows:', parsed.data.length);
  if (parsed.data.length > 0) {
    console.log('[CSV Parse Debug]: Row 1 Sample:', JSON.stringify(parsed.data[0]));
  }

  const validRows: CsvCatalogRow[] = [];
  const errors: RowValidationError[] = [];

  const seenSkus = new Set<string>();

  parsed.data.forEach((raw, idx) => {
    const rowNum = idx + 2; // account for header line and 1-based index
    const rowErrors: string[] = [];

    const sku = getRawField(raw, 'sku', 'product_id', 'item_code', 'code', 'product_code', 'id', 'item_id', 'sku_code', 'item_no', 'item');
    const name = getRawField(raw, 'name', 'product_name', 'title', 'product_title', 'item_name', 'product', 'design_name');
    const category = getRawField(raw, 'category', 'category_name', 'type', 'product_type', 'collection', 'item_type', 'department', 'cat');
    const priceRaw = getRawField(raw, 'price', 'selling_price', 'sale_price', 'offer_price', 'rate', 'unit_price', 'amount', 'sp', 'retail_price').replace(/,/g, '');
    const mrpRaw = getRawField(raw, 'mrp', 'regular_price', 'original_price', 'list_price', 'market_price', 'compare_at_price', 'cp').replace(/,/g, '');
    const stockRaw = getRawField(raw, 'stock', 'qty', 'quantity', 'inventory', 'stock_quantity', 'available_stock', 'units') || '10';
    const weightRaw = getRawField(raw, 'weight_grams', 'weight', 'weight_g', 'gross_weight', 'net_weight') || '0';

    if (!sku) {
      rowErrors.push('SKU is required (Column: SKU / Item Code / Product ID)');
    } else if (seenSkus.has(sku)) {
      rowErrors.push(`Duplicate SKU "${sku}" within the file`);
    } else {
      seenSkus.add(sku);
    }

    if (!name) rowErrors.push('Name is required (Column: Name / Product Name / Title)');
    if (!category) rowErrors.push('Category is required (Column: Category / Type / Collection)');

    const price = parseFloat(priceRaw);
    if (isNaN(price) || price <= 0) {
      rowErrors.push(`Price must be a positive number (found: "${priceRaw || 'empty'}")`);
    }

    const mrp = mrpRaw ? parseFloat(mrpRaw) : (isNaN(price) ? 0 : price);
    if (isNaN(mrp) || (!isNaN(price) && mrp < price)) {
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

    const description = getRawField(raw, 'description', 'desc', 'details', 'product_description', 'item_description') || `${name} - Handcrafted fine jewellery`;
    const subcategory = getRawField(raw, 'subcategory', 'sub_category', 'sub_type') || undefined;
    const metal = getRawField(raw, 'metal', 'metal_type', 'material') || 'Gold';
    const purity = getRawField(raw, 'purity', 'gold_purity', 'karat') || '22K';
    const stone = getRawField(raw, 'stone', 'stone_type', 'gemstone', 'diamond') || 'None';
    const occasion = getRawField(raw, 'occasion', 'wear') || 'Festive';
    const gender = getRawField(raw, 'gender', 'for') || 'Women';
    const imageUrls = getRawField(raw, 'image_urls', 'images', 'image', 'image_url', 'photo', 'photos', 'picture', 'product_image', 'img') || '/products/gold-floral-ring.jpg';
    const isBestsellerRaw = getRawField(raw, 'is_bestseller', 'bestseller', 'featured');
    const isBestseller = ['true', '1', 'yes'].includes(isBestsellerRaw.toLowerCase());
    const status = (getRawField(raw, 'status', 'is_active', 'product_status') || 'ACTIVE').toUpperCase();

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
        description,
        category,
        subcategory,
        price,
        mrp,
        stock,
        metal,
        purity,
        stone,
        occasion,
        gender,
        weight_grams: weightGrams,
        image_urls: imageUrls,
        is_bestseller: isBestseller,
        status: ['ACTIVE', 'INACTIVE', 'DRAFT'].includes(status) ? status : 'ACTIVE',
      });
    }
  });

  return {
    validRows,
    errors,
    totalRows: parsed.data.length,
    detectedHeaders: parsed.meta.fields,
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
    const gidMatch = trimmed.match(/gid=([0-9]+)/);
    const gidParam = gidMatch && gidMatch[1] ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?output=csv${gidParam}`;
  }

  // 2. Standard Google Sheets sharing URL:
  // e.g. https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
  const sheetMatch = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (sheetMatch && sheetMatch[1] && sheetMatch[1] !== 'e') {
    const docId = sheetMatch[1];
    const gidMatch = trimmed.match(/gid=([0-9]+)/);
    const gidParam = gidMatch && gidMatch[1] ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv${gidParam}`;
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
          `Google Sheet access denied (HTTP ${res.status}). Your Google Sheet is currently set to "Restricted". In your Google Sheet, click "Share" (top-right) -> General access -> change to "Anyone with the link can view". Or use File -> Share -> Publish to web -> select sheet -> Comma-separated values (.csv) and paste that link.`
        );
      }
      throw new Error(`Failed to download spreadsheet: HTTP ${res.status} ${res.statusText}`);
    }

    const csvText = await res.text();
    console.log('[Google Sheet Download Status]: HTTP', res.status);
    console.log('[Google Sheet Export URL]:', exportUrl);
    console.log('[Google Sheet Raw CSV Preview (first 300 chars)]:\n', csvText.slice(0, 300));
    console.log('[Google Sheet Raw CSV Total Length]:', csvText.length);

    if (csvText.trim().startsWith('<!DOCTYPE html') || csvText.includes('<html')) {
      throw new Error(
        `Received HTML webpage instead of CSV. This happens when the Google Sheet is private. In your Google Sheet, go to Share -> General access -> select "Anyone with the link" (Viewer).`
      );
    }
    const validation = parseAndValidateCsv(csvText);

    if (validation.validRows.length === 0) {
      if (validation.errors.length === 0) {
        throw new Error(
          `Your Google Sheet was connected successfully, but it contains 0 product rows (only headers or blank). Please add at least 1 product row below the headers (Row 2 onwards), or ensure you copied the link of the specific tab that contains your products.`
        );
      }
      const sampleErrors = validation.errors
        .slice(0, 3)
        .map((e) => `Row ${e.rowNumber} (${e.sku}): ${e.errors.join(', ')}`)
        .join(' | ');
      const detectedHeadersStr = validation.detectedHeaders && validation.detectedHeaders.length > 0
        ? ` (Headers found in Row 1: [${validation.detectedHeaders.join(', ')}])`
        : '';
      throw new Error(
        `No valid products found in CSV. ${validation.errors.length} rows had errors: ${sampleErrors}.${detectedHeadersStr}`
      );
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
