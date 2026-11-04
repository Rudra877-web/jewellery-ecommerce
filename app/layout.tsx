import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import CartDrawer from '@/components/cart/CartDrawer';
import WhatsAppFloatingWidget from '@/components/layout/WhatsAppFloatingWidget';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Jewellery Mate | Handcrafted Fine Indian Jewellery',
  description:
    'Discover exquisite 22K Gold, Uncut Polki Diamonds, GIA Certified Solitaires & 925 Sterling Silver jewellery crafted for the Indian bride and everyday elegance. Insured pan-India shipping.',
  keywords: [
    'Indian Jewellery',
    '22K Gold',
    'Polki Diamonds',
    'Bridal Jewellery',
    'Solitaires',
    'Temple Jewellery',
    '925 Silver',
    'Jewellery Mate',
  ],
  openGraph: {
    title: 'Jewellery Mate | Luxury Handcrafted Jewellery',
    description: 'Bespoke fine jewellery crafted in pure hallmarked gold, solitaires and uncut polki.',
    url: 'https://jewellerymate.com',
    siteName: 'Jewellery Mate',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${plusJakartaSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1C1917] antialiased">
        {children}
        <CartDrawer />
        <WhatsAppFloatingWidget />
      </body>
    </html>
  );
}
