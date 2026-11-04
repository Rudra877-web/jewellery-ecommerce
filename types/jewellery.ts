export type MetalType = 'Gold' | 'Silver' | 'Rose Gold' | 'Platinum' | 'Artificial';
export type PurityType = '24K' | '22K' | '18K' | '14K' | '925';
export type StoneType = 'Diamond' | 'Emerald' | 'Ruby' | 'Sapphire' | 'Pearl' | 'Polki' | 'Kundan' | 'None';
export type OccasionType = 'Bridal' | 'Party' | 'Daily Wear' | 'Festive' | 'Gift';
export type GenderType = 'Women' | 'Men' | 'Unisex' | 'Kids';

export interface ProductData {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  metal: string;
  purity: string;
  stone: string;
  occasion: string;
  gender: string;
  weightGrams: number;
  images: string[];
  isBestseller: boolean;
  unitsSold: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: string | null;
  createdAt?: string | Date;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
  _count?: {
    products: number;
  };
}

export interface HeroSlideData {
  id: string;
  title: string;
  subtitle?: string | null;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CartItem {
  id: string; // product id
  sku: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  stock: number;
  metal: string;
  purity: string;
  weightGrams: number;
}

export interface OrderItemInput {
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  metal?: string;
  purity?: string;
}

export interface CheckoutFormValues {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  pincode: string;
  city: string;
  state: string;
  paymentMethod: 'COD' | 'RAZORPAY';
}

export interface FilterOptions {
  metals: string[];
  purities: string[];
  stones: string[];
  occasions: string[];
  genders: string[];
  minPrice: number;
  maxPrice: number;
  minWeight: number;
  maxWeight: number;
}
