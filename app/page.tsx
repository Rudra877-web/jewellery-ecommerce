import React from 'react';
import Header from '@/components/layout/Header';
import HeroSlider from '@/components/home/HeroSlider';
import CategoriesSection from '@/components/home/CategoriesSection';
import BestSellingSection from '@/components/home/BestSellingSection';
import Footer from '@/components/layout/Footer';
import prisma from '@/lib/prisma';
import { CategoryData, HeroSlideData, ProductData } from '@/types/jewellery';


export default async function HomePage() {
  // 1. Fetch categories
  const rawCategories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { products: { where: { status: 'ACTIVE' } } },
      },
    },
  });

  const categories: CategoryData[] = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    sortOrder: c.sortOrder,
    _count: { products: c._count.products },
  }));

  // 2. Fetch active hero slides from admin database
  const rawSlides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  const slides: HeroSlideData[] = rawSlides.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    ctaText: s.ctaText,
    ctaLink: s.ctaLink,
    imageUrl: s.imageUrl,
    sortOrder: s.sortOrder,
    isActive: s.isActive,
  }));

  // 3. Fetch Best Selling products (ranked by unitsSold, then isBestseller flag)
  const rawProducts = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    orderBy: [
      { unitsSold: 'desc' },
      { isBestseller: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 8,
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  const products: ProductData[] = rawProducts.map((p) => ({
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

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      {/* 1. Header */}
      <Header categories={categories} />

      {/* 2. Full-width Hero Slider */}
      <HeroSlider slides={slides} />

      {/* 3. Categories Section */}
      <CategoriesSection categories={categories} />

      {/* 4. Best Selling Products Section */}
      <BestSellingSection products={products} />

      {/* 5. Footer */}
      <Footer />
    </div>
  );
}
