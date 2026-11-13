import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminSession } from '@/lib/admin-auth';

export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, slides });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { title, subtitle, ctaText, ctaLink, imageUrl, sortOrder, isActive } = await req.json();

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and Image URL are required' }, { status: 400 });
    }

    const slide = await prisma.heroSlide.create({
      data: {
        title: title.trim(),
        subtitle: subtitle?.trim(),
        ctaText: ctaText?.trim() || 'Shop Collection',
        ctaLink: ctaLink?.trim() || '/category/all',
        imageUrl: imageUrl.trim(),
        sortOrder: parseInt(sortOrder, 10) || 1,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, slide });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create slide' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { id, isActive, sortOrder } = await req.json();

    const data: Record<string, unknown> = {};
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (typeof sortOrder === 'number') data.sortOrder = sortOrder;

    const updated = await prisma.heroSlide.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, slide: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Slide ID is required' }, { status: 400 });

    await prisma.heroSlide.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
  }
}
