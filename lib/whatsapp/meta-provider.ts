import {
  WhatsAppProvider,
  OrderWhatsAppDetails,
  WhatsAppNotificationResult,
  MetaWhatsAppMessagePayload,
} from './types';

export interface MetaProviderOptions {
  token?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  templateName?: string;
  templateLang?: string;
  apiVersion?: string;
}

/**
 * Normalizes phone number into international format without + or symbols.
 * Defaults 10-digit Indian numbers with '91'.
 */
export function normalizeWhatsAppRecipient(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Official Meta WhatsApp Cloud API Provider
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
export class MetaWhatsAppProvider implements WhatsAppProvider {
  name = 'meta';

  private token: string;
  private phoneNumberId: string;
  private businessAccountId?: string;
  private templateName: string;
  private templateLang: string;
  private apiVersion: string;

  constructor(options?: MetaProviderOptions | string, phoneId?: string) {
    if (typeof options === 'string') {
      this.token = (options || '').trim();
      this.phoneNumberId = (phoneId || '').trim();
      this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim();
      this.templateName = process.env.WHATSAPP_TEMPLATE_NAME?.trim() || 'order_confirmation';
      this.templateLang = process.env.WHATSAPP_TEMPLATE_LANG?.trim() || 'en';
      this.apiVersion = 'v21.0';
    } else {
      this.token = (
        options?.token ||
        process.env.WHATSAPP_ACCESS_TOKEN ||
        process.env.WHATSAPP_TOKEN ||
        ''
      ).trim();
      this.phoneNumberId = (
        options?.phoneNumberId ||
        process.env.WHATSAPP_PHONE_NUMBER_ID ||
        ''
      ).trim();
      this.businessAccountId = (
        options?.businessAccountId ||
        process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ||
        ''
      ).trim();
      this.templateName = (
        options?.templateName ||
        process.env.WHATSAPP_TEMPLATE_NAME ||
        'order_confirmation'
      ).trim();
      this.templateLang = (
        options?.templateLang ||
        process.env.WHATSAPP_TEMPLATE_LANG ||
        'en'
      ).trim();
      this.apiVersion = options?.apiVersion || 'v21.0';
    }
  }

  /**
   * Helper to build summary text for order items
   */
  private buildItemsSummary(order: OrderWhatsAppDetails): string {
    return order.items
      .map((i) => `${i.name} (${i.sku}) x${i.quantity}`)
      .join(', ');
  }

  /**
   * Sanitize error message to prevent token leakage
   */
  private sanitizeError(raw: string): string {
    if (!this.token) return raw;
    return raw.replace(new RegExp(this.token, 'g'), '[REDACTED_ACCESS_TOKEN]');
  }

  /**
   * Send Meta Cloud API message payload
   */
  private async dispatchMetaPayload(
    payload: MetaWhatsAppMessagePayload
  ): Promise<WhatsAppNotificationResult> {
    if (!this.token || !this.phoneNumberId) {
      return {
        success: false,
        error:
          'Meta WhatsApp Cloud API credentials missing: WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not set.',
        provider: this.name,
      };
    }

    const endpoint = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    try {
      console.log(
        `[Meta WhatsApp Cloud API] Dispatching ${payload.type} message to: ${payload.to}`
      );

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        // Not JSON
      }

      if (res.ok && data?.messages?.[0]?.id) {
        const messageId = data.messages[0].id;
        console.log(`[Meta WhatsApp Cloud API] Successfully sent messageId: ${messageId}`);
        return {
          success: true,
          messageId,
          provider: this.name,
          details: {
            recipient: payload.to,
            template: payload.template?.name,
          },
        };
      }

      // Handle Meta API error structure
      const metaError = data?.error;
      const errorCode = metaError?.code;
      const errorSubcode = metaError?.error_subcode;
      const errorMessage = metaError?.message || rawText;
      const errorDetails = metaError?.error_data?.details || '';

      const formattedError = this.sanitizeError(
        `Meta API error (${res.status}) [Code ${errorCode || 'N/A'}${
          errorSubcode ? `:${errorSubcode}` : ''
        }]: ${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`
      );

      console.warn(`[Meta WhatsApp Cloud API Failure]: ${formattedError}`);

      return {
        success: false,
        error: formattedError,
        provider: this.name,
        details: {
          recipient: payload.to,
          template: payload.template?.name,
          metaCode: errorCode,
          metaSubcode: errorSubcode,
        },
      };
    } catch (e: unknown) {
      const errStr = this.sanitizeError(
        e instanceof Error ? e.message : 'Network error during Meta API call'
      );
      console.error('[Meta WhatsApp Cloud API Exception]:', errStr);
      return {
        success: false,
        error: errStr,
        provider: this.name,
      };
    }
  }

  /**
   * Send order confirmation to customer using approved Meta template
   */
  async sendOrderConfirmationToCustomer(
    customerPhone: string,
    order: OrderWhatsAppDetails
  ): Promise<WhatsAppNotificationResult> {
    const cleanPhone = normalizeWhatsAppRecipient(customerPhone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return {
        success: false,
        error: `Invalid customer phone number: ${customerPhone}`,
        provider: this.name,
      };
    }

    const itemsSummary = this.buildItemsSummary(order);
    const amountText = `Rs. ${order.totalAmount.toLocaleString('en-IN')}`;

    // 1. Attempt template-based dispatch (Required for business-initiated messages)
    const templatePayload: MetaWhatsAppMessagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'template',
      template: {
        name: this.templateName,
        language: { code: this.templateLang },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: order.customerName || 'Customer' },
              { type: 'text', text: order.orderNumber },
              { type: 'text', text: amountText },
              { type: 'text', text: itemsSummary.slice(0, 100) },
            ],
          },
        ],
      },
    };

    const templateResult = await this.dispatchMetaPayload(templatePayload);

    // If template succeeds, return immediately
    if (templateResult.success) {
      return templateResult;
    }

    // If template fails due to template mismatch (e.g. code 132000 / 132001), try text fallback if within active window
    if (templateResult.details?.metaCode === 132001 || templateResult.details?.metaCode === 132000) {
      console.warn(
        `[Meta WhatsApp] Template "${this.templateName}" not found in Meta account. Attempting text fallback message...`
      );
      const textFallbackPayload: MetaWhatsAppMessagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: {
          body:
            `✨ *Order Confirmed - Jewellery Mate* ✨\n\n` +
            `Hello ${order.customerName}!\n` +
            `Thank you for your order *${order.orderNumber}* for ${amountText}.\n` +
            `Items: ${itemsSummary}\n` +
            `Delivery Address: ${order.shippingAddress}, ${order.city} - ${order.pincode}\n\n` +
            `Your handcrafted jewellery is being prepared with insured transit.`,
        },
      };

      const fallbackResult = await this.dispatchMetaPayload(textFallbackPayload);
      if (fallbackResult.success) {
        return fallbackResult;
      }
    }

    return templateResult;
  }

  /**
   * Send order confirmation/alert to store owner
   */
  async sendOrderConfirmationToOwner(
    ownerPhone: string,
    order: OrderWhatsAppDetails
  ): Promise<WhatsAppNotificationResult> {
    const cleanPhone = normalizeWhatsAppRecipient(ownerPhone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return {
        success: false,
        error: `Invalid owner phone number: ${ownerPhone}`,
        provider: this.name,
      };
    }

    const itemsSummary = this.buildItemsSummary(order);
    const amountText = `Rs. ${order.totalAmount.toLocaleString('en-IN')}`;

    // 1. Attempt template-based dispatch
    const templatePayload: MetaWhatsAppMessagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'template',
      template: {
        name: this.templateName,
        language: { code: this.templateLang },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: `Owner Alert - ${order.customerName}` },
              { type: 'text', text: order.orderNumber },
              { type: 'text', text: amountText },
              { type: 'text', text: itemsSummary.slice(0, 100) },
            ],
          },
        ],
      },
    };

    const templateResult = await this.dispatchMetaPayload(templatePayload);
    if (templateResult.success) {
      return templateResult;
    }

    // Fallback: If template is not recognized, attempt rich text dispatch
    const textPayload: MetaWhatsAppMessagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        body:
          `✨ *New Order Confirmed - Jewellery Mate* ✨\n\n` +
          `*Order #:* ${order.orderNumber}\n` +
          `*Customer:* ${order.customerName} (${order.customerPhone})\n` +
          `*Amount:* ${amountText} (${order.paymentMethod})\n` +
          `*Address:* ${order.shippingAddress}, ${order.city}, ${order.state} - ${order.pincode}\n` +
          `*Items:* ${itemsSummary}\n\n` +
          `*Admin Link:* ${order.adminOrderUrl}`,
      },
    };

    const textResult = await this.dispatchMetaPayload(textPayload);
    if (textResult.success) {
      return textResult;
    }

    // Return the original template error as it is the primary standard requirement for Meta API
    return templateResult;
  }

  /**
   * Test Meta credentials using standard 'hello_world' or custom template
   */
  async testConnection(
    recipientPhone: string,
    templateToTest?: string
  ): Promise<WhatsAppNotificationResult> {
    const cleanPhone = normalizeWhatsAppRecipient(recipientPhone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return {
        success: false,
        error: 'Please provide a valid 10-digit phone number with country code for test dispatch.',
        provider: this.name,
      };
    }

    const testTemplate = (templateToTest || this.templateName || 'hello_world').trim();

    // If testing hello_world: Meta default template has code "en_US" without parameters
    const isHelloWorld = testTemplate.toLowerCase() === 'hello_world';
    const langCode = isHelloWorld ? 'en_US' : this.templateLang;

    const testPayload: MetaWhatsAppMessagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'template',
      template: {
        name: testTemplate,
        language: { code: langCode },
        ...(isHelloWorld
          ? {}
          : {
              components: [
                {
                  type: 'body',
                  parameters: [
                    { type: 'text', text: 'Test Customer' },
                    { type: 'text', text: 'TEST-ORD-001' },
                    { type: 'text', text: 'Rs. 9,999' },
                    { type: 'text', text: 'Gold Diamond Ring (SKU-TEST)' },
                  ],
                },
              ],
            }),
      },
    };

    const result = await this.dispatchMetaPayload(testPayload);

    // If hello_world failed, try simple text fallback
    if (!result.success && !isHelloWorld) {
      console.log('[Meta Test] Trying hello_world template fallback...');
      const helloWorldPayload: MetaWhatsAppMessagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' },
        },
      };
      const helloWorldResult = await this.dispatchMetaPayload(helloWorldPayload);
      if (helloWorldResult.success) {
        return {
          success: true,
          messageId: helloWorldResult.messageId,
          provider: this.name,
          details: {
            recipient: cleanPhone,
            template: 'hello_world (Default Meta Template)',
          },
        };
      }
    }

    return result;
  }
}
