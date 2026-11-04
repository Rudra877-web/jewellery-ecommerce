import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'jm_admin_auth';

export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  return authCookie?.value === 'authenticated';
}

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
export { ADMIN_COOKIE_NAME };
