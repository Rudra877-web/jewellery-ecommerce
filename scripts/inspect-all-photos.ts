import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.product.findMany({ select: { sku: true, name: true, images: true } });
  const unsplashIds = new Map<string, string[]>();

  for (const p of prods) {
    const urls = p.images.split('|');
    for (const u of urls) {
      if (u.includes('unsplash.com/photo-')) {
        const match = u.match(/photo-([a-zA-Z0-9_-]+)/);
        if (match) {
          const id = match[0];
          if (!unsplashIds.has(id)) {
            unsplashIds.set(id, []);
          }
          unsplashIds.get(id)!.push(`[${p.sku}] ${p.name}`);
        }
      }
    }
  }

  console.log(`Found ${unsplashIds.size} unique Unsplash photos:`);
  for (const [id, usedIn] of unsplashIds.entries()) {
    try {
      const pageUrl = `https://unsplash.com/photos/${id.replace('photo-', '')}`;
      const res = await fetch(pageUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      const html = await res.text();
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      const title = titleMatch ? titleMatch[1].replace(' | Unsplash', '').trim() : 'Unknown';
      console.log(`${id} => "${title}" (used in: ${usedIn.join(', ')})`);
    } catch (e: any) {
      console.log(`${id} => Error: ${e.message}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
