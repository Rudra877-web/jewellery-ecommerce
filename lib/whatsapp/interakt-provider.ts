// Deprecated: Interakt provider has been removed in favor of official Meta WhatsApp Cloud API.
// Kept only as a no-op placeholder for any legacy imports.

import { WhatsAppProvider, OrderWhatsAppDetails, WhatsAppNotificationResult } from './types';

export class InteraktWhatsAppProvider implements WhatsAppProvider {
  name = 'interakt';

  async sendOrderConfirmationToOwner(
    _ownerPhone: string,
    _order: OrderWhatsAppDetails
  ): Promise<WhatsAppNotificationResult> {
    return {
      success: false,
      error: 'Interakt integration is deprecated and disabled. Please configure Meta WhatsApp Cloud API.',
      provider: this.name,
    };
  }
}
