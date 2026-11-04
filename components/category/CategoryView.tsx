'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, RotateCcw, Check } from 'lucide-react';
import { ProductData, CategoryData } from '@/types/jewellery';
import ProductCard from '@/components/product/ProductCard';

interface CategoryViewProps {
  category: CategoryData;
  initialProducts: ProductData[];
  allCategories: CategoryData[];
}

export default function CategoryView({
  category,
  initialProducts,
}: CategoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Read initial filter values from URL
  const selectedMetals = useMemo(
    () => searchParams.getAll('metal'),
    [searchParams]
  );
  const selectedPurities = useMemo(
    () => searchParams.getAll('purity'),
    [searchParams]
  );
  const selectedStones = useMemo(
    () => searchParams.getAll('stone'),
    [searchParams]
  );
  const selectedOccasions = useMemo(
    () => searchParams.getAll('occasion'),
    [searchParams]
  );
  const selectedGenders = useMemo(
    () => searchParams.getAll('gender'),
    [searchParams]
  );
  const inStockOnly = searchParams.get('inStock') === 'true';
  const sortOption = searchParams.get('sort') || 'bestseller';
  const searchFilter = (searchParams.get('search') || '').toLowerCase();

  // Dynamic filter options aggregated from products in this category
  const dynamicFacets = useMemo(() => {
    const metals = new Map<string, number>();
    const purities = new Map<string, number>();
    const stones = new Map<string, number>();
    const occasions = new Map<string, number>();
    const genders = new Map<string, number>();

    let minPrice = Infinity;
    let maxPrice = 0;
    let minWeight = Infinity;
    let maxWeight = 0;

    initialProducts.forEach((p) => {
      metals.set(p.metal, (metals.get(p.metal) || 0) + 1);
      purities.set(p.purity, (purities.get(p.purity) || 0) + 1);
      if (p.stone && p.stone !== 'None') {
        stones.set(p.stone, (stones.get(p.stone) || 0) + 1);
      }
      occasions.set(p.occasion, (occasions.get(p.occasion) || 0) + 1);
      genders.set(p.gender, (genders.get(p.gender) || 0) + 1);

      if (p.price < minPrice) minPrice = p.price;
      if (p.price > maxPrice) maxPrice = p.price;
      if (p.weightGrams < minWeight) minWeight = p.weightGrams;
      if (p.weightGrams > maxWeight) maxWeight = p.weightGrams;
    });

    return {
      metals: Array.from(metals.entries()).sort(),
      purities: Array.from(purities.entries()).sort(),
      stones: Array.from(stones.entries()).sort(),
      occasions: Array.from(occasions.entries()).sort(),
      genders: Array.from(genders.entries()).sort(),
      priceRange: [minPrice === Infinity ? 0 : minPrice, maxPrice],
      weightRange: [minWeight === Infinity ? 0 : minWeight, maxWeight],
    };
  }, [initialProducts]);

  // URL state updater
  const updateUrlParam = (key: string, values: string[] | string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);

    if (Array.isArray(values)) {
      values.forEach((v) => params.append(key, v));
    } else if (values !== null && values !== '') {
      params.set(key, values);
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const toggleFacet = (key: string, currentValues: string[], val: string) => {
    const next = currentValues.includes(val)
      ? currentValues.filter((v) => v !== val)
      : [...currentValues, val];
    updateUrlParam(key, next);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    if (sortOption !== 'bestseller') params.set('sort', sortOption);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        if (searchFilter) {
          const match =
            p.name.toLowerCase().includes(searchFilter) ||
            p.description.toLowerCase().includes(searchFilter) ||
            p.metal.toLowerCase().includes(searchFilter) ||
            p.stone.toLowerCase().includes(searchFilter) ||
            p.sku.toLowerCase().includes(searchFilter);
          if (!match) return false;
        }
        if (inStockOnly && p.stock <= 0) return false;
        if (selectedMetals.length > 0 && !selectedMetals.includes(p.metal)) return false;
        if (selectedPurities.length > 0 && !selectedPurities.includes(p.purity)) return false;
        if (selectedStones.length > 0 && !selectedStones.includes(p.stone)) return false;
        if (selectedOccasions.length > 0 && !selectedOccasions.includes(p.occasion)) return false;
        if (selectedGenders.length > 0 && !selectedGenders.includes(p.gender)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        if (sortOption === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        // Default: bestseller (unitsSold desc, then isBestseller)
        if (b.unitsSold !== a.unitsSold) return b.unitsSold - a.unitsSold;
        return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      });
  }, [
    initialProducts,
    searchFilter,
    inStockOnly,
    selectedMetals,
    selectedPurities,
    selectedStones,
    selectedOccasions,
    selectedGenders,
    sortOption,
  ]);

  const activeFiltersCount =
    selectedMetals.length +
    selectedPurities.length +
    selectedStones.length +
    selectedOccasions.length +
    selectedGenders.length +
    (inStockOnly ? 1 : 0);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [searchParams]);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header / Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <span className="text-xs uppercase tracking-widest font-semibold text-stone-900">
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </span>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-[#9A7B1C] hover:underline flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All
          </button>
        )}
      </div>

      {/* In-stock toggle */}
      <div className="pb-4 border-b border-stone-200">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-medium text-stone-800">In Stock Designs Only</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateUrlParam('inStock', e.target.checked ? 'true' : null)}
            className="w-4 h-4 text-[#D4AF37] rounded border-stone-300 focus:ring-[#D4AF37]"
          />
        </label>
      </div>

      {/* Metals Filter */}
      {dynamicFacets.metals.length > 0 && (
        <div className="pb-5 border-b border-stone-200 space-y-2.5">
          <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
            Precious Metal
          </h4>
          <div className="space-y-1.5">
            {dynamicFacets.metals.map(([metal, count]) => {
              const checked = selectedMetals.includes(metal);
              return (
                <label key={metal} className="flex items-center justify-between text-xs text-stone-700 cursor-pointer hover:text-stone-900">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFacet('metal', selectedMetals, metal)}
                      className="w-4 h-4 text-[#D4AF37] rounded border-stone-300 focus:ring-[#D4AF37]"
                    />
                    <span>{metal}</span>
                  </div>
                  <span className="text-stone-600 text-[11px]">({count})</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Purity Filter */}
      {dynamicFacets.purities.length > 0 && (
        <div className="pb-5 border-b border-stone-200 space-y-2.5">
          <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
            Gold / Metal Purity
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {dynamicFacets.purities.map(([purity, count]) => {
              const checked = selectedPurities.includes(purity);
              return (
                <button
                  type="button"
                  key={purity}
                  onClick={() => toggleFacet('purity', selectedPurities, purity)}
                  className={`text-xs px-2.5 py-1.5 rounded-md border flex items-center justify-between transition-colors ${
                    checked
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-stone-900 font-semibold'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <span>{purity}</span>
                  <span className="text-[10px] text-stone-600">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Gemstones / Stones */}
      {dynamicFacets.stones.length > 0 && (
        <div className="pb-5 border-b border-stone-200 space-y-2.5">
          <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
            Gemstone & Polki
          </h4>
          <div className="space-y-1.5">
            {dynamicFacets.stones.map(([stone, count]) => {
              const checked = selectedStones.includes(stone);
              return (
                <label key={stone} className="flex items-center justify-between text-xs text-stone-700 cursor-pointer hover:text-stone-900">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFacet('stone', selectedStones, stone)}
                      className="w-4 h-4 text-[#D4AF37] rounded border-stone-300 focus:ring-[#D4AF37]"
                    />
                    <span>{stone}</span>
                  </div>
                  <span className="text-stone-600 text-[11px]">({count})</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Occasion */}
      {dynamicFacets.occasions.length > 0 && (
        <div className="pb-5 border-b border-stone-200 space-y-2.5">
          <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
            Occasion
          </h4>
          <div className="space-y-1.5">
            {dynamicFacets.occasions.map(([occasion, count]) => {
              const checked = selectedOccasions.includes(occasion);
              return (
                <label key={occasion} className="flex items-center justify-between text-xs text-stone-700 cursor-pointer hover:text-stone-900">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFacet('occasion', selectedOccasions, occasion)}
                      className="w-4 h-4 text-[#D4AF37] rounded border-stone-300 focus:ring-[#D4AF37]"
                    />
                    <span>{occasion}</span>
                  </div>
                  <span className="text-stone-600 text-[11px]">({count})</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Gender */}
      {dynamicFacets.genders.length > 0 && (
        <div className="pb-5 border-b border-stone-200 space-y-2.5">
          <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
            Gender
          </h4>
          <div className="space-y-1.5">
            {dynamicFacets.genders.map(([gender, count]) => {
              const checked = selectedGenders.includes(gender);
              return (
                <label key={gender} className="flex items-center justify-between text-xs text-stone-700 cursor-pointer hover:text-stone-900">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFacet('gender', selectedGenders, gender)}
                      className="w-4 h-4 text-[#D4AF37] rounded border-stone-300 focus:ring-[#D4AF37]"
                    />
                    <span>{gender}</span>
                  </div>
                  <span className="text-stone-600 text-[11px]">({count})</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Category Banner Title */}
      <div className="mb-8 pb-6 border-b border-stone-200">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 text-xs sm:text-sm text-stone-600 font-light max-w-3xl leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {/* Controls Bar: Mobile Filters Button & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200 mb-8">
        {/* Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider font-medium rounded-full shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          <span className="text-xs text-stone-500 font-medium">
            Showing <strong className="text-stone-900">{filteredProducts.length}</strong> creations
          </span>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-xs text-stone-500 font-medium">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortOption}
            onChange={(e) => updateUrlParam('sort', e.target.value)}
            className="text-xs bg-white border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D4AF37] font-medium text-stone-800"
          >
            <option value="bestseller">Best Selling First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Creations</option>
          </select>
        </div>
      </div>

      {/* Main Grid & Desktop Filter Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar (Left 1 Col) */}
        <aside className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm sticky top-28">
          <FilterContent />
        </aside>

        {/* Product Grid (Right 3 Cols) */}
        <main className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-4">
              <h3 className="font-serif text-2xl font-medium text-stone-800">
                No matching creations found
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Try loosening your filter selections or explore other fine categories.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 text-xs font-semibold uppercase tracking-wider rounded-full transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Slide-out Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
                <span className="font-serif text-lg font-semibold text-stone-900">Filters</span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                <FilterContent />
              </div>

              <div className="pt-6 border-t border-stone-200 mt-6">
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-full py-3 bg-stone-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
                >
                  Apply Filters ({filteredProducts.length} Results)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
