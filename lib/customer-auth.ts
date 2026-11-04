import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export const CUSTOMER_COOKIE_NAME = 'jm_customer_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'jewellery_mate_customer_auth_secret_2026';

export interface CustomerSessionPayload {
  userId: string;
  phone: string;
  name: string;
  email?: string | null;
  role: string;
  exp: number;
}

// 1. Password Hashing using PBKDF2
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash: `${salt}:${hash}`, salt };
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(testHash, 'hex'));
  } catch {
    return false;
  }
}

// 2. Token creation and verification (stateless signed token)
export function signCustomerToken(payload: Omit<CustomerSessionPayload, 'exp'>): string {
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
  const data: CustomerSessionPayload = { ...payload, exp };
  const json = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(json).digest('base64url');
  return `${json}.${signature}`;
}

export function verifyCustomerToken(token: string): CustomerSessionPayload | null {
  try {
    const [json, signature] = token.split('.');
    if (!json || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(json).digest('base64url');
    if (signature !== expectedSig) return null;

    const payload: CustomerSessionPayload = JSON.parse(Buffer.from(json, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// 3. Next.js Server Session helpers
export async function getCustomerSession(): Promise<CustomerSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyCustomerToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentCustomer() {
  const session = await getCustomerSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      address: true,
      pincode: true,
      city: true,
      state: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}
