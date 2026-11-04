import { WhatsAppProvider, OrderWhatsAppDetails, WhatsAppNotificationResult } from './types';
import { MetaWhatsAppProvider } from './meta-provider';
import { MockWhatsAppProvider } from './mock-provider';
import prisma from '@/lib/prisma';

export interface SendWhatsAppNotificationOptions {
  force?: boolean;
  notifyCustomer?: boolean;
  notifyOwner?: boolean;
}

/**
 * Resolves the active WhatsApp provider instance based on environment variables and database settings.
 * Prioritizes Meta WhatsApp Cloud API whenever credentials are present.
 */
export async function getWhatsAppProvider(): Promise<{
  provider: WhatsAppProvider;
  ownerPhone: string;
  providerType: string;
}> {
  let settings = null;
  try {
    settings = await prisma.adminSettings.findUnique({
      where: { id: 'default' },
    });
  } catch (err) {
    console.warn('[WhatsApp] Could not load admin settings from DB, falling back to env:', err);
  }

  const ownerPhone =
    settings?.ownerWhatsappNumber?.trim() ||
    process.env.OWNER_WHATSAPP_NUMBER?.trim() ||
    '916352273970';

  const providerType = (settings?.whatsappProvider || 'meta').toLowerCase().trim();

  // Resolve Meta Cloud API credentials from Server-Side Env or DB settings
  const token = (
    process.env.WHATSAPP_ACCESS_TOKEN ||
    process.env.WHATSAPP_TOKEN ||
    settings?.whatsappToken ||
    ''
  ).trim();

  const phoneId = (
    process.env.WHATSAPP_PHONE_NUMBER_ID ||
    settings?.whatsappPhoneId ||
    ''
  ).trim();

  const businessAccountId = (process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '').trim();

  // If user explicitly configured mock or direct
  if (providerType === 'mock' || providerType === 'direct') {
    return {
      provider: new MockWhatsAppProvider(),
      ownerPhone,
      providerType,
    };
  }

  // Meta WhatsApp Cloud API
  if (token && phoneId) {
    return {
      provider: new MetaWhatsAppProvider({
        token,
        phoneNumberId: phoneId,
        businessAccountId,
      }),
      ownerPhone,
      providerType: 'meta',
    };
  }

  // If credentials are incomplete, fallback gracefully to Mock mode with a clear diagnostic log
  console.warn(
    '[WhatsApp] Meta WhatsApp Cloud API credentials incomplete. Ensure WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID are configured in .env. Falling back to simulated log mode.'
  );

  return {
    provider: new MockWhatsAppProvider(),
    ownerPhone,
    providerType: 'mock',
  };
}

/**
 * Dispatch retry-safe order notification to store owner and customer via Meta WhatsApp Cloud API.
 * Updates order record with dispatch status, timestamps, and retry counters.
 */
export async function sendOrderWhatsAppNotification(
  order: OrderWhatsAppDetails,
  options?: SendWhatsAppNotificationOptions
): Promise<WhatsAppNotificationResult> {
  const { force = false, notifyCustomer = false, notifyOwner = true } = options || {};

  // 1. Check existing order state for idempotency & retry-safety
  if (!force && order.orderNumber) {
    try {
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber: order.orderNumber },
        select: { whatsappSent: true, whatsappRetryCount: true },
      });

      if (existingOrder?.whatsappSent) {
        console.log(
          `[WhatsApp] Notification already dispatched for order ${order.orderNumber}. Skipping duplicate.`
        );
        return {
          success: true,
          messageId: 'already_dispatched',
          provider: 'cached',
        };
      }
    } catch {
      // Non-blocking query error, proceed with dispatch
    }
  }

  // 2. Resolve provider
  const { provider, ownerPhone } = await getWhatsAppProvider();

  let finalResult: WhatsAppNotificationResult = {
    success: false,
    error: 'No dispatch target specified',
    provider: provider.name,
  };

  // 3. Dispatch to Store Owner
  if (notifyOwner && ownerPhone) {
    finalResult = await provider.sendOrderConfirmationToOwner(ownerPhone, order);
  }

  // 4. Dispatch to Customer (if enabled and phone provided)
  if (notifyCustomer && order.customerPhone && provider.sendOrderConfirmationToCustomer) {
    try {
      const custResult = await provider.sendOrderConfirmationToCustomer(order.customerPhone, order);
      if (!custResult.success) {
        console.warn(
          `[WhatsApp Customer Notification Warning]: ${custResult.error}`
        );
      }
    } catch (custErr) {
      console.warn('[WhatsApp Customer Notification Exception]:', custErr);
    }
  }

  // 5. Update Order Record with dispatch metadata
  if (order.orderNumber) {
    try {
      await prisma.order.update({
        where: { orderNumber: order.orderNumber },
        data: {
          whatsappSent: finalResult.success,
          whatsappError: finalResult.success ? null : (finalResult.error?.slice(0, 500) || 'Dispatch failed'),
          whatsappSentAt: finalResult.success ? new Date() : null,
          whatsappRetryCount: { increment: 1 },
        },
      });
    } catch (err) {
      console.error('[WhatsApp DB Status Update Error]:', err);
    }
  }

  return finalResult;
}

/**
 * Backward-compatible wrapper for existing order creation and Razorpay verification callers.
 */
export async function sendOwnerOrderWhatsAppNotification(
  order: OrderWhatsAppDetails
): Promise<WhatsAppNotificationResult> {
  return sendOrderWhatsAppNotification(order, { notifyOwner: true, notifyCustomer: true });
}
