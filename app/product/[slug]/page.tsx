import React from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductDetailView from '@/components/product/ProductDetailView';
import prisma from '@/lib/prisma';
import { CategoryData, ProductData } from '@/types/jewellery';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!product) {
      return { title: 'Product Not Found | Jewellery Mate' };
    }

    const images = product.images.split('|').map((s) => s.trim()).filter(Boolean);

    return {
      title: `${product.name} | Jewellery Mate`,
      description: product.description,
      openGraph: {
        title: `${product.name} | Handcrafted Indian Jewellery`,
        description: product.description,
        images: images.length > 0 ? [{ url: images[0] }] : undefined,
      },
    };
  } catch {
    return { title: 'Fine Jewellery | Jewellery Mate' };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let rawProduct = null;
  let rawRelated: any[] = [];
  let allCategoriesRaw: any[] = [];

  try {
    // 1. Fetch Product
    rawProduct = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (rawProduct && rawProduct.status !== 'INACTIVE') {
      // 2. Fetch Related Products
      rawRelated = await prisma.product.findMany({
        where: {
          categoryId: rawProduct.categoryId,
          id: { not: rawProduct.id },
          status: 'ACTIVE',
        },
        take: 4,
        orderBy: { unitsSold: 'desc' },
      });

      // 3. Fetch all categories for navigation
      allCategoriesRaw = await prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
      });
    }
  } catch (err) {
    console.warn('[ProductPage] Database query skipped or failed:', err);
  }

  if (!rawProduct || rawProduct.status === 'INACTIVE') {
    notFound();
  }

  const product: ProductData = {
    id: rawProduct.id,
    sku: rawProduct.sku,
    name: rawProduct.name,
    slug: rawProduct.slug,
    description: rawProduct.description,
    price: rawProduct.price,
    mrp: rawProduct.mrp,
    stock: rawProduct.stock,
    metal: rawProduct.metal,
    purity: rawProduct.purity,
    stone: rawProduct.stone,
    occasion: rawProduct.occasion,
    gender: rawProduct.gender,
    weightGrams: rawProduct.weightGrams,
    images: rawProduct.images.split('|').map((s: string) => s.trim()).filter(Boolean),
    isBestseller: rawProduct.isBestseller,
    unitsSold: rawProduct.unitsSold,
    status: rawProduct.status as 'ACTIVE' | 'INACTIVE' | 'DRAFT',
    categoryId: rawProduct.categoryId,
    category: rawProduct.category,
    subcategory: rawProduct.subcategory,
    createdAt: rawProduct.createdAt.toISOString(),
  };

  const relatedProducts: ProductData[] = rawRelated.map((p) => ({
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
    images: p.images.split('|').map((s: string) => s.trim()).filter(Boolean),
    isBestseller: p.isBestseller,
    unitsSold: p.unitsSold,
    status: p.status as 'ACTIVE' | 'INACTIVE' | 'DRAFT',
    categoryId: p.categoryId,
    subcategory: p.subcategory,
  }));

  const allCategories: CategoryData[] = allCategoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    sortOrder: c.sortOrder,
  }));

  // 4. Schema.org JSON-LD structured data for Google Shopping and Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Jewellery Mate',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Jewellery Mate',
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      {/* JSON-LD Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header categories={allCategories} />
      <main className="flex-1">
        <ProductDetailView product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </div>
  );
}
