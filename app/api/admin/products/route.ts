import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminSession } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('search') || '';
    const categoryId = req.nextUrl.searchParams.get('categoryId') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });

    return NextResponse.json({ success: true, products });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// Create new product manually
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      sku,
      name,
      description,
      price,
      mrp,
      stock,
      metal,
      purity,
      stone,
      occasion,
      gender,
      weightGrams,
      images,
      isBestseller,
      categoryId,
      subcategory,
      status,
    } = body;

    if (!sku || !name || !categoryId || !price) {
      return NextResponse.json({ error: 'SKU, Name, Category and Price are required.' }, { status: 400 });
    }

    const slug = `${name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')}-${sku.toLowerCase()}`;

    const product = await prisma.product.create({
      data: {
        sku: sku.trim(),
        name: name.trim(),
        slug,
        description: description?.trim() || `${name} - Handcrafted fine jewellery`,
        price: parseFloat(price),
        mrp: parseFloat(mrp || price),
        stock: parseInt(stock, 10) || 10,
        metal: metal || 'Gold',
        purity: purity || '22K',
        stone: stone || 'None',
        occasion: occasion || 'Festive',
        gender: gender || 'Women',
        weightGrams: parseFloat(weightGrams) || 5.0,
        images: images || '/products/gold-floral-ring.jpg',
        isBestseller: Boolean(isBestseller),
        categoryId,
        subcategory,
        status: status || 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create product' },
      { status: 500 }
    );
  }
}

// Fast patch for best-seller toggle or status toggle
export async function PATCH(req: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { id, isBestseller, status } = await req.json();

    const data: Record<string, unknown> = {};
    if (typeof isBestseller === 'boolean') data.isBestseller = isBestseller;
    if (typeof status === 'string') data.status = status;

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
