export interface OrderSummaryForWhatsApp {
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  items?: Array<{
    name: string;
    sku: string;
    quantity: number;
    price: number;
  }>;
}

/**
 * Format clean international phone number without +, -, spaces
 * Default to 91 (India) if 10 digits
 */
export function normalizeIndianWhatsAppNumber(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `91${clean}`;
  }
  if (clean.length === 12 && clean.startsWith('91')) {
    return clean;
  }
  return clean;
}

/**
 * Generate 1-click wa.me link for sending confirmed order summary to store owner
 */
export function generateOrderWhatsAppLink(
  ownerPhone: string,
  order: OrderSummaryForWhatsApp
): string {
  const cleanOwnerPhone = normalizeIndianWhatsAppNumber(ownerPhone);

  const itemsText = (order.items || [])
    .map(
      (item) => `• *${item.name}* [${item.sku}] × ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString('en-IN')}`
    )
    .join('\n');

  const addressText = order.shippingAddress
    ? `📍 *Delivery Address:*\n${order.shippingAddress}, ${order.city || ''}, ${order.state || ''} - ${order.pincode || ''}\n\n`
    : '';

  const message =
    `💎 *NEW ORDER CONFIRMATION - JEWELLERY MATE* 💎\n\n` +
    `*Order Ref:* ${order.orderNumber}\n` +
    `*Customer:* ${order.customerName} (${order.customerPhone || 'N/A'})\n\n` +
    addressText +
    (itemsText ? `🛍️ *Order Items:*\n${itemsText}\n\n` : '') +
    `💰 *Total Amount:* ₹${order.totalAmount.toLocaleString('en-IN')} (${order.paymentMethod})\n` +
    `✨ *Status:* Confirmed & Ready for Insured Dispatch\n\n` +
    `_Thank you for choosing Jewellery Mate Fine Jewellery!_`;

  return `https://wa.me/${cleanOwnerPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate 1-click wa.me link to send order update from admin to customer
 */
export function generateCustomerUpdateWhatsAppLink(
  customerPhone: string,
  order: {
    orderNumber: string;
    customerName: string;
    awbCode?: string | null;
    courierName?: string | null;
    trackingUrl?: string | null;
  }
): string {
  const cleanCustomerPhone = normalizeIndianWhatsAppNumber(customerPhone);

  const shippingInfo = order.awbCode
    ? `🚚 *Courier:* ${order.courierName || 'Blue Dart / Delhivery'}\n📦 *AWB Tracking No:* ${order.awbCode}\n`
    : `🚚 *Status:* In Processing & Hallmarking verification\n`;

  const trackingLink = order.trackingUrl ? `🔗 *Track Online:* ${order.trackingUrl}\n\n` : '\n';

  const message =
    `Namaste ${order.customerName}! ✨\n\n` +
    `Update on your *Jewellery Mate* order *${order.orderNumber}*:\n\n` +
    shippingInfo +
    trackingLink +
    `Your precious handcrafted jewels are safely insured in transit.\n\n` +
    `For any concierge assistance, simply reply here.\n\n` +
    `Warm regards,\n*Jewellery Mate Concierge*`;

  return `https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(message)}`;
}
