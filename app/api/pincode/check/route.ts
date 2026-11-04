import { NextRequest, NextResponse } from 'next/server';
import { lookupPincode } from '@/lib/pincode';
import { checkShiprocketServiceability } from '@/lib/shiprocket';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { pincode } = await req.json();

    if (!pincode || typeof pincode !== 'string') {
      return NextResponse.json({ error: 'Valid 6-digit pincode is required' }, { status: 400 });
    }

    const cleanPin = pincode.trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit Indian pincode' }, { status: 400 });
    }

    // 1. Resolve city / state
    const locationInfo = await lookupPincode(cleanPin);

    // 2. Query Shiprocket serviceability
    let settings = null;
    try {
      settings = await prisma.adminSettings.findUnique({ where: { id: 'default' } });
    } catch (dbErr) {
      console.warn('[Pincode Check]: Could not fetch admin settings from DB, using fallback env', dbErr);
    }

    const creds = {
      email: settings?.shiprocketEmail || process.env.SHIPROCKET_EMAIL,
      password: settings?.shiprocketPassword || process.env.SHIPROCKET_PASSWORD,
      sandbox: settings?.shiprocketSandbox ?? true,
    };

    const shiprocketResult = await checkShiprocketServiceability(cleanPin, '110001', 0.5, true, creds);

    return NextResponse.json({
      success: true,
      pincode: cleanPin,
      city: locationInfo?.city || 'Your Area',
      state: locationInfo?.state || 'India',
      serviceable: shiprocketResult.serviceable,
      courierName: shiprocketResult.courierName,
      estimatedDeliveryDays: shiprocketResult.estimatedDeliveryDays,
      codAvailable: shiprocketResult.codAvailable,
      shippingRate: shiprocketResult.rate,
      mockMode: shiprocketResult.mockMode,
    });
  } catch (err: unknown) {
    console.error('Pincode check error:', err);
    return NextResponse.json({ error: 'Failed to verify pincode serviceability' }, { status: 500 });
  }
}
