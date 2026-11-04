import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Meta WhatsApp Cloud API Webhook Route
 * Path: /api/webhooks/whatsapp
 *
 * 1. GET: Webhook verification challenge invoked by Meta Developers
 *    - Query params: hub.mode, hub.verify_token, hub.challenge
 *    - Compares hub.verify_token against WHATSAPP_VERIFY_TOKEN
 *    - Returns hub.challenge as raw plain text with HTTP 200 on success
 *    - Returns HTTP 403 on verification mismatch
 *    - No redirects, completely unauthenticated, public endpoint
 *
 * 2. POST: Event notification callback for incoming messages and delivery statuses
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const expectedVerifyToken = (
      process.env.WHATSAPP_VERIFY_TOKEN ||
      'jewellery_whatsapp_verify_2026'
    ).trim();

    console.log('[Meta WhatsApp Webhook GET Verification]:', {
      mode,
      receivedToken: token ? `${token.slice(0, 8)}...` : null,
      matches: token === expectedVerifyToken,
      challengePresent: Boolean(challenge),
    });

    // Check if Meta subscription mode is 'subscribe' and token matches
    if (mode === 'subscribe' && token === expectedVerifyToken) {
      console.log('[Meta WhatsApp Webhook Verified Successfully]');
      // Meta strictly requires plain text challenge string with HTTP 200 (no quotes, no JSON wrapper)
      return new Response(challenge || '', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    console.warn('[Meta WhatsApp Webhook Verification Rejected]: Token mismatch or invalid mode.');
    return new Response('Forbidden: Verification token mismatch', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err: unknown) {
    console.error('[Meta WhatsApp Webhook GET Error]:', err);
    return new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value) {
      // 1. Delivery status updates (sent, delivered, read, failed)
      const statuses = value?.statuses;
      if (Array.isArray(statuses) && statuses.length > 0) {
        for (const s of statuses) {
          console.log(
            `[Meta WhatsApp Webhook Status]: Message ${s.id} is now "${s.status}" for recipient ${s.recipient_id}`
          );
          if (s.status === 'failed') {
            console.warn(`[Meta WhatsApp Delivery Failure]:`, JSON.stringify(s.errors || s));
          }
        }
      }

      // 2. Incoming customer messages
      const messages = value?.messages;
      if (Array.isArray(messages) && messages.length > 0) {
        for (const m of messages) {
          const from = m.from;
          const text = m.text?.body || m.type;
          console.log(`[Meta WhatsApp Incoming Message from ${from}]: "${text}"`);
        }
      }
    }

    // Always return 200 OK to acknowledge event receipt to Meta Graph API
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err: unknown) {
    console.error('[Meta WhatsApp Webhook POST Error]:', err);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
