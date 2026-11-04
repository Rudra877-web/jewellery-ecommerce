import { WhatsAppProvider, OrderWhatsAppDetails, WhatsAppNotificationResult } from './types';

export class MockWhatsAppProvider implements WhatsAppProvider {
  name = 'mock';

  async sendOrderConfirmationToOwner(
    ownerPhone: string,
    order: OrderWhatsAppDetails
  ): Promise<WhatsAppNotificationResult> {
    const itemsSummary = order.items
      .map((i) => `• ${i.name} [${i.sku}] x ${i.quantity} = ₹${(i.price * i.quantity).toLocaleString('en-IN')}`)
      .join('\n');

    console.log('\n======================================================');
    console.log('📱 [MOCK WHATSAPP DISPATCH TO OWNER]');
    console.log(`To: ${ownerPhone}`);
    console.log(`Order Number: ${order.orderNumber}`);
    console.log(`Customer: ${order.customerName} (${order.customerPhone})`);
    console.log(`Address: ${order.shippingAddress}, ${order.city}, ${order.state} - ${order.pincode}`);
    console.log(`Items:\n${itemsSummary}`);
    console.log(`Total: ₹${order.totalAmount.toLocaleString('en-IN')} (${order.paymentMethod})`);
    console.log(`Admin Link: ${order.adminOrderUrl}`);
    console.log('======================================================\n');

    return {
      success: true,
      messageId: `wamid.mock.${Date.now()}.${Math.floor(Math.random() * 100000)}`,
      provider: 'mock',
      mockMode: true,
    };
  }
}
