import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoryView from '@/components/category/CategoryView';
import prisma from '@/lib/prisma';
import { CategoryData, ProductData } from '@/types/jewellery';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === 'all') {
    return {
      title: 'All Jewellery Collections | Jewellery Mate',
      description: 'Explore the complete catalogue of 22K Gold, Solitaires, Polki and Sterling Silver jewellery.',
    };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) return { title: 'Category Not Found | Jewellery Mate' };

    return {
      title: `${category.name} Collection | Jewellery Mate`,
      description: category.description || `Handcrafted fine ${category.name} in 22K Gold and diamonds.`,
    };
  } catch {
    return { title: 'Collections | Jewellery Mate' };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  let allCategories: CategoryData[] = [];
  let currentCategory: CategoryData = {
    id: 'all',
    name: 'All Creations',
    slug: 'all',
    description: 'Explore our complete repertoire of timeless royal Indian fine jewellery.',
    sortOrder: 0,
  };
  let products: ProductData[] = [];

  try {
    // 1. Fetch all categories for navigation
    const allCategoriesRaw = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    allCategories = allCategoriesRaw.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      sortOrder: c.sortOrder,
    }));

    let productsQueryWhere: Record<string, unknown> = { status: 'ACTIVE' };

    if (slug !== 'all') {
      const foundCategory = allCategoriesRaw.find((c) => c.slug === slug);
      if (!foundCategory) {
        notFound();
      }
      currentCategory = {
        id: foundCategory.id,
        name: foundCategory.name,
        slug: foundCategory.slug,
        description: foundCategory.description,
        image: foundCategory.image,
        sortOrder: foundCategory.sortOrder,
      };
      productsQueryWhere = {
        status: 'ACTIVE',
        categoryId: foundCategory.id,
      };
    }

    // 2. Fetch products in this category
    const rawProducts = await prisma.product.findMany({
      where: productsQueryWhere,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [
        { unitsSold: 'desc' },
        { isBestseller: 'desc' },
      ],
    });

    products = rawProducts.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      mrp: p.mrp,
      stock: p.stock,
      metal: p.metal,
      purity: p.purity,
      stone: p.stone,
      occasion: p.occasion,
      gender: p.gender,
      weightGrams: p.weightGrams,
      images: p.images.split('|').map((s) => s.trim()).filter(Boolean),
      isBestseller: p.isBestseller,
      unitsSold: p.unitsSold,
      status: p.status as 'ACTIVE' | 'INACTIVE' | 'DRAFT',
      categoryId: p.categoryId,
      category: p.category,
      subcategory: p.subcategory,
      createdAt: p.createdAt.toISOString(),
    }));
  } catch (err) {
    console.warn('[CategoryPage] Database query skipped or failed:', err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      <Header categories={allCategories} />
      <div className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs text-stone-400">Loading fine collections...</div>}>
          <CategoryView
            category={currentCategory}
            initialProducts={products}
            allCategories={allCategories}
          />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
