import React from 'react';

/**
 * 100% Pure, verified high-resolution luxury jewellery images
 */
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  rings: '/products/gold-floral-ring.jpg',
  necklaces: '/products/gold-temple-haaram.jpg',
  earrings: '/products/meenakari-chandbali.jpg',
  'bangles-bracelets': '/products/antique-gold-kadas.jpg',
  solitaires: '/products/solitaire-diamond-ring.jpg',
};

export const FALLBACK_JEWELLERY_IMAGE = '/products/gold-temple-haaram.jpg';

export const BANGLE_IMAGES = [
  '/products/antique-gold-kadas.jpg',
  '/products/gold-bangles-set.jpg',
  '/products/diamond-tennis-bracelet.jpg',
  'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
];

/**
 * Pure SVG Data URI placeholder for ultimate offline/failsafe reliability.
 * Elegant luxury gold insignia with Jewellery Mate branding.
 */
export const SVG_FALLBACK =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22bgGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%232C2A29%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%231A1817%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22goldGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23F3E7C4%22%2F%3E%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%23D4AF37%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%239A7B1C%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20fill%3D%22url(%23bgGrad)%22%20width%3D%22600%22%20height%3D%22600%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22260%22%20r%3D%2290%22%20stroke%3D%22url(%23goldGrad)%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20opacity%3D%220.5%22%2F%3E%3Cpath%20d%3D%22M300%20195%20L345%20260%20L300%20325%20L255%20260%20Z%22%20fill%3D%22url(%23goldGrad)%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22260%22%20r%3D%2216%22%20fill%3D%22%23FAF8F5%22%20opacity%3D%220.9%22%2F%3E%3Ctext%20x%3D%22300%22%20y%3D%22410%22%20font-family%3D%22Georgia%2C%20serif%22%20font-size%3D%2224%22%20font-weight%3D%22600%22%20letter-spacing%3D%224%22%20fill%3D%22url(%23goldGrad)%22%20text-anchor%3D%22middle%22%3EJEWELLERY%20MATE%3C%2Ftext%3E%3Ctext%20x%3D%22300%22%20y%3D%22445%22%20font-family%3D%22sans-serif%22%20font-size%3D%2211%22%20font-weight%3D%22600%22%20letter-spacing%3D%223%22%20fill%3D%22%23C5A059%22%20text-anchor%3D%22middle%22%3EFINE%20INDIAN%20JEWELLERY%3C%2Ftext%3E%3C%2Fsvg%3E";

/**
 * Safe Image error event handler that gracefully cascades from a remote fallback to SVG.
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl: string = FALLBACK_JEWELLERY_IMAGE
) {
  const target = e.currentTarget;
  if (!target.dataset.fallbackStep) {
    target.dataset.fallbackStep = 'remote';
    target.src = fallbackUrl;
  } else if (target.dataset.fallbackStep === 'remote') {
    target.dataset.fallbackStep = 'svg';
    target.src = SVG_FALLBACK;
  }
}
