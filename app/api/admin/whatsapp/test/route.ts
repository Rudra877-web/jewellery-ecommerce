import { NextRequest, NextResponse } from 'next/server';
import { MetaWhatsAppProvider } from '@/lib/whatsapp/meta-provider';
import prisma from '@/lib/prisma';
import { checkAdminSession } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    let phone: string | undefined;
    let templateName: string | undefined;

    try {
      const body = await req.json();
      phone = body.phone;
      templateName = body.templateName;
    } catch {
      // Empty body is acceptable
    }

    // Load credentials from DB settings or server-side env
    let settings = null;
    try {
      settings = await prisma.adminSettings.findUnique({ where: { id: 'default' } });
    } catch {
      // Ignore DB error
    }

    const token = (
      process.env.WHATSAPP_ACCESS_TOKEN ||
      process.env.WHATSAPP_TOKEN ||
      settings?.whatsappToken ||
      ''
    ).trim();

    const phoneNumberId = (
      process.env.WHATSAPP_PHONE_NUMBER_ID ||
      settings?.whatsappPhoneId ||
      ''
    ).trim();

    const targetPhone = (
      phone ||
      settings?.ownerWhatsappNumber ||
      process.env.OWNER_WHATSAPP_NUMBER ||
      '916352273970'
    ).trim();

    if (!token || !phoneNumberId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Meta WhatsApp Cloud API credentials missing. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env or Admin Settings.',
        },
        { status: 400 }
      );
    }

    const provider = new MetaWhatsAppProvider({
      token,
      phoneNumberId,
      templateName: templateName || process.env.WHATSAPP_TEMPLATE_NAME || 'hello_world',
      templateLang: process.env.WHATSAPP_TEMPLATE_LANG || 'en_US',
    });

    const result = await provider.testConnection(targetPhone, templateName);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: result.details,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test message sent successfully to ${targetPhone} via Meta WhatsApp Cloud API! (Message ID: ${result.messageId})`,
      messageId: result.messageId,
      details: result.details,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to test Meta WhatsApp API',
      },
      { status: 500 }
    );
  }
}

