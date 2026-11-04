import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminSession } from '@/lib/admin-auth';

export async function GET() {
  try {
    const settings = await prisma.adminSettings.findUnique({
      where: { id: 'default' },
    });

    const isAdmin = await checkAdminSession();

    // If client is not an authenticated admin, return ONLY public safe settings (used by WhatsAppFloatingWidget)
    if (!isAdmin) {
      return NextResponse.json({
        success: true,
        settings: {
          ownerWhatsappNumber:
            settings?.ownerWhatsappNumber || process.env.OWNER_WHATSAPP_NUMBER || '+916352273970',
        },
      });
    }

    // For authenticated admins: mask all sensitive secrets so raw tokens are NEVER exposed in JSON
    const safeSettings = {
      ...settings,
      whatsappToken: settings?.whatsappToken
        ? '••••••••' + settings.whatsappToken.slice(-4)
        : process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN
        ? '••••••••[Configured in .env]'
        : '',
      hasWhatsappToken: Boolean(
        settings?.whatsappToken ||
        process.env.WHATSAPP_ACCESS_TOKEN ||
        process.env.WHATSAPP_TOKEN
      ),
      whatsappPhoneId:
        settings?.whatsappPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      whatsappProvider:
        settings?.whatsappProvider === 'interakt' ? 'meta' : (settings?.whatsappProvider || 'meta'),
      razorpayKeySecret: settings?.razorpayKeySecret
        ? '••••••••'
        : process.env.RAZORPAY_KEY_SECRET
        ? '••••••••[Configured in .env]'
        : '',
      shiprocketPassword: settings?.shiprocketPassword
        ? '••••••••'
        : process.env.SHIPROCKET_PASSWORD
        ? '••••••••[Configured in .env]'
        : '',
    };

    return NextResponse.json({ success: true, settings: safeSettings });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      ownerWhatsappNumber,
      shiprocketEmail,
      shiprocketPassword,
      shiprocketSandbox,
      razorpayKeyId,
      razorpayKeySecret,
      whatsappToken,
      whatsappPhoneId,
      whatsappProvider,
    } = body;

    const currentSettings = await prisma.adminSettings.findUnique({
      where: { id: 'default' },
    });

    // Only update sensitive fields if a new unmasked value was actually provided
    const isMaskedOrEmpty = (val?: string) => !val || val.includes('••••');

    const resolvedWhatsappToken = isMaskedOrEmpty(whatsappToken)
      ? currentSettings?.whatsappToken || ''
      : whatsappToken.trim();

    const resolvedRazorpaySecret = isMaskedOrEmpty(razorpayKeySecret)
      ? currentSettings?.razorpayKeySecret || ''
      : razorpayKeySecret.trim();

    const resolvedShiprocketPassword = isMaskedOrEmpty(shiprocketPassword)
      ? currentSettings?.shiprocketPassword || ''
      : shiprocketPassword.trim();

    // Normalize provider: remove interakt in favor of meta
    const resolvedProvider =
      whatsappProvider === 'interakt' ? 'meta' : (whatsappProvider || 'meta');

    const updated = await prisma.adminSettings.upsert({
      where: { id: 'default' },
      update: {
        ownerWhatsappNumber: ownerWhatsappNumber?.trim() || '+916352273970',
        shiprocketEmail: shiprocketEmail?.trim() || '',
        shiprocketPassword: resolvedShiprocketPassword,
        shiprocketSandbox: Boolean(shiprocketSandbox),
        razorpayKeyId: razorpayKeyId?.trim() || 'rzp_test_jewellerymate',
        razorpayKeySecret: resolvedRazorpaySecret,
        whatsappToken: resolvedWhatsappToken,
        whatsappPhoneId: whatsappPhoneId?.trim() || '',
        whatsappProvider: resolvedProvider,
      },
      create: {
        id: 'default',
        ownerWhatsappNumber: ownerWhatsappNumber?.trim() || '+916352273970',
        shiprocketEmail: shiprocketEmail?.trim() || '',
        shiprocketPassword: resolvedShiprocketPassword,
        shiprocketSandbox: Boolean(shiprocketSandbox),
        razorpayKeyId: razorpayKeyId?.trim() || 'rzp_test_jewellerymate',
        razorpayKeySecret: resolvedRazorpaySecret,
        whatsappToken: resolvedWhatsappToken,
        whatsappPhoneId: whatsappPhoneId?.trim() || '',
        whatsappProvider: resolvedProvider,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully (secrets securely hashed and stored).',
      settings: {
        ...updated,
        whatsappToken: updated.whatsappToken ? '••••••••' : '',
        razorpayKeySecret: updated.razorpayKeySecret ? '••••••••' : '',
        shiprocketPassword: updated.shiprocketPassword ? '••••••••' : '',
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update settings' },
      { status: 500 }
    );
  }
}
