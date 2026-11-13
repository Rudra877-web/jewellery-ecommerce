'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Zap,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  IndianRupee,
} from 'lucide-react';
import { ProductData } from '@/types/jewellery';
import { useCartStore } from '@/lib/cart-store';
import { handleImageError, FALLBACK_JEWELLERY_IMAGE } from '@/lib/image-fallback';

interface ProductDetailViewProps {
  product: ProductData;
  relatedProducts: ProductData[];
}

export default function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const imagesList = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? (product.images as string).split('|').map((s) => s.trim()).filter(Boolean)
    : [];

  const [selectedImage, setSelectedImage] = useState<string>(
    imagesList[0] || FALLBACK_JEWELLERY_IMAGE
  );

  const [zoomStyle, setZoomStyle] = useState<{ x: number; y: number; isHover: boolean }>({
    x: 0,
    y: 0,
    isHover: false,
  });

  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<{
    city: string;
    state: string;
    serviceable: boolean;
    estimatedDeliveryDays: number;
    codAvailable: boolean;
    courierName: string;
  } | null>(null);
  const [pincodeError, setPincodeError] = useState('');

  const discountPercent =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  // Zoom mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ x, y, isHover: true });
  };

  const handleMouseLeave = () => {
    setZoomStyle((prev) => ({ ...prev, isHover: false }));
  };

  // Pincode verification handler
  const handlePincodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setPincodeError('');
    setPincodeResult(null);

    const clean = pincode.trim().replace(/\D/g, '');
    if (clean.length !== 6) {
      setPincodeError('Please enter a 6-digit Indian PIN code');
      return;
    }

    setPincodeLoading(true);
    try {
      const res = await fetch('/api/pincode/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: clean }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPincodeResult(data);
      } else {
        setPincodeError(data.error || 'Unable to check delivery for this pincode');
      }
    } catch {
      setPincodeError('Network error checking delivery');
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        price: product.price,
        mrp: product.mrp,
        image: selectedImage,
        stock: product.stock,
        metal: product.metal,
        purity: product.purity,
        weightGrams: product.weightGrams,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 sm:pb-10">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-stone-500 mb-6 sm:mb-8 flex items-center space-x-2 overflow-x-auto no-scrollbar whitespace-nowrap">
        <a href="/" className="hover:text-stone-900 transition-colors">Home</a>
        <span>/</span>
        {product.category && (
          <>
            <a href={`/category/${product.category.slug}`} className="hover:text-stone-900 transition-colors">
              {product.category.name}
            </a>
            <span>/</span>
          </>
        )}
        <span className="text-stone-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase (2-column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        {/* Left Column: Image Gallery with Interactive Zoom */}
        <div className="space-y-4">
          {/* Main Large Image Container */}
          <div
            className="relative w-full aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 cursor-crosshair shadow-md"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={selectedImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-200 ${
                zoomStyle.isHover ? 'scale-150' : 'scale-100'
              }`}
              style={{
                transformOrigin: `${zoomStyle.x}% ${zoomStyle.y}%`,
              }}
              onError={handleImageError}
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
              {product.isBestseller && (
                <span className="inline-flex items-center gap-1.5 bg-[#171717] text-[#E6CA65] text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-[#D4AF37]/50 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Best Seller
                </span>
              )}
              {discountPercent > 0 && (
                <span className="bg-emerald-700 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            <div className="absolute bottom-3 right-3 bg-stone-900/70 backdrop-blur-sm text-stone-200 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md pointer-events-none">
              Hover to Zoom
            </div>
          </div>

          {/* Thumbnails Strip */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imagesList.map((imgUrl, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImage === imgUrl
                      ? 'border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/30'
                      : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Price, Attributes Table, Pincode & Action Buttons */}
        <div className="space-y-6">
          {/* Header & SKU */}
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>SKU: {product.sku}</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <Check className="w-3.5 h-3.5" />
                {product.stock > 0 ? 'In Stock & Ready to Ship' : 'Made to Order'}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-stone-900 leading-tight">
              {product.name}
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price & Savings */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-stone-900 font-sans">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-base text-stone-400 line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Save ₹{(product.mrp - product.price).toLocaleString('en-IN')} ({discountPercent}%)
                  </span>
                </>
              )}
            </div>
            <div className="text-[11px] text-stone-500">
              Inclusive of all taxes • Complimentary insured transit
            </div>
          </div>

          {/* Attributes Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-stone-100/70 px-4 py-2.5 border-b border-stone-200 text-xs font-semibold text-stone-900 uppercase tracking-wider">
              Jewellery Specifications
            </div>
            <div className="divide-y divide-stone-100 text-xs">
              <div className="grid grid-cols-2 px-4 py-2.5">
                <span className="text-stone-500 font-medium">Precious Metal</span>
                <span className="text-stone-900 font-semibold">{product.metal}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2.5">
                <span className="text-stone-500 font-medium">Gold / Metal Purity</span>
                <span className="text-stone-900 font-semibold">{product.purity}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2.5">
                <span className="text-stone-500 font-medium">Gross Weight</span>
                <span className="text-stone-900 font-semibold">{product.weightGrams} grams</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2.5">
                <span className="text-stone-500 font-medium">Gemstone / Polki</span>
                <span className="text-stone-900 font-semibold">{product.stone || 'None'}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2.5">
                <span className="text-stone-500 font-medium">Occasion</span>
                <span className="text-stone-900 font-semibold">{product.occasion}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2.5">
                <span className="text-stone-500 font-medium">Gender</span>
                <span className="text-stone-900 font-semibold">{product.gender}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2.5">
                <span className="text-stone-500 font-medium">Hallmark Certification</span>
                <span className="text-[#9A7B1C] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> BIS Govt. Hallmarked
                </span>
              </div>
            </div>
          </div>

          {/* Shiprocket Pincode Delivery Checker */}
          <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-900 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span>Check Delivery & Serviceability</span>
            </div>

            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode (e.g. 110001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="flex-1 text-xs py-2 px-3 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37] font-medium"
              />
              <button
                type="submit"
                disabled={pincodeLoading || pincode.length !== 6}
                className="px-4 py-2 bg-stone-900 hover:bg-[#9A7B1C] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-40"
              >
                {pincodeLoading ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pincodeError && (
              <p className="text-xs text-rose-600 font-medium">{pincodeError}</p>
            )}

            {pincodeResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1.5 text-emerald-900">
                <div className="font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Delivering to {pincodeResult.city}, {pincodeResult.state} ({pincode})</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-600">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Estimated transit: <strong>{pincodeResult.estimatedDeliveryDays} business days</strong> via {pincodeResult.courierName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-600">
                  <Truck className="w-3.5 h-3.5 text-stone-400" />
                  <span>100% Free Insured Express Transit</span>
                </div>
                {pincodeResult.codAvailable && (
                  <div className="text-[11px] text-emerald-700 font-medium">
                    ✓ Cash on Delivery (COD) eligible for this pincode
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-stone-700">Quantity:</span>
              <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-stone-600 hover:text-stone-900 transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-bold text-stone-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-1.5 text-stone-600 hover:text-stone-900 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl flex items-center justify-center gap-2 font-medium text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-40"
              >
                <ShoppingBag className="w-4 h-4 text-[#E6CA65]" />
                <span>Add to Bag</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full py-4 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-xl hover:scale-[1.02] disabled:opacity-40"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-200 text-center text-[11px] text-stone-500">
            <div className="p-2 space-y-1">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] mx-auto" />
              <span>100% BIS Hallmarked</span>
            </div>
            <div className="p-2 space-y-1">
              <Truck className="w-4 h-4 text-[#D4AF37] mx-auto" />
              <span>Blue Dart Insured Transit</span>
            </div>
            <div className="p-2 space-y-1">
              <RotateCcw className="w-4 h-4 text-[#D4AF37] mx-auto" />
              <span>15-Day Return Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Creations Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 sm:mt-24 pt-8 sm:pt-12 border-t border-stone-200">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-1.5 sm:space-y-2">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A7B1C]">
              Harmonious Complements
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">
              Related Fine Creations
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {relatedProducts.slice(0, 4).map((rel) => (
              <div key={rel.id} className="transform hover:-translate-y-1 transition-transform">
                <a href={`/product/${rel.slug}`} className="block group">
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200 mb-2 sm:mb-3">
                    <img
                      src={
                        Array.isArray(rel.images)
                          ? rel.images[0]
                          : typeof rel.images === 'string'
                          ? (rel.images as string).split('|')[0]
                          : '/products/gold-floral-ring.jpg'
                      }
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={handleImageError}
                    />
                  </div>
                  <h4 className="font-serif text-xs sm:text-base font-medium text-stone-900 group-hover:text-[#9A7B1C] transition-colors truncate">
                    {rel.name}
                  </h4>
                  <div className="text-xs sm:text-sm font-semibold text-stone-900 mt-0.5 sm:mt-1">
                    ₹{rel.price.toLocaleString('en-IN')}
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Fixed Sticky Purchase Bar */}
      <div className="sm:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-wider text-stone-500 block">Total Price</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-stone-900 font-sans">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.price && (
              <span className="text-[10px] text-stone-400 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#E6CA65]" />
            <span>Bag</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
