export interface OrderWhatsAppDetails {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  totalAmount: number;
  paymentMethod: string;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    price: number;
  }>;
  adminOrderUrl: string;
}

export interface WhatsAppNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
  mockMode?: boolean;
  details?: {
    recipient?: string;
    template?: string;
    metaCode?: number;
    metaSubcode?: number;
  };
}

export interface MetaTemplateComponentParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
}

export interface MetaTemplateComponent {
  type: 'header' | 'body' | 'button';
  sub_type?: 'url' | 'quick_reply';
  index?: number;
  parameters: MetaTemplateComponentParameter[];
}

export interface MetaWhatsAppMessagePayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'template' | 'text';
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: MetaTemplateComponent[];
  };
  text?: {
    body: string;
    preview_url?: boolean;
  };
}

export interface WhatsAppProvider {
  name: string;
  sendOrderConfirmationToOwner(
    ownerPhone: string,
    order: OrderWhatsAppDetails
  ): Promise<WhatsAppNotificationResult>;
  sendOrderConfirmationToCustomer?(
    customerPhone: string,
    order: OrderWhatsAppDetails
  ): Promise<WhatsAppNotificationResult>;
}
