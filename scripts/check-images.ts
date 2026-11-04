import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function check() {
  const cats = await prisma.category.findMany();
  const prods = await prisma.product.findMany();
  const slides = await prisma.heroSlide.findMany();
  const allUrls = new Set<string>();

  cats.forEach(c => c.image && allUrls.add(c.image));
  slides.forEach(s => s.imageUrl && allUrls.add(s.imageUrl));
  prods.forEach(p => {
    p.images.split('|').forEach(u => u && allUrls.add(u.trim()));
  });

  console.log(`Found ${allUrls.size} distinct URLs.`);
  let localOk = 0;
  let remoteOk = 0;
  let fail = 0;

  for (const url of allUrls) {
    if (url.startsWith('/')) {
      const filePath = path.join(process.cwd(), 'public', url.slice(1));
      if (fs.existsSync(filePath)) {
        localOk++;
        console.log(`200 LOCAL  | ${url} (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB)`);
      } else {
        fail++;
        console.log(`ERR LOCAL  | Missing file: ${filePath}`);
      }
    } else {
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.status === 200) {
          remoteOk++;
          console.log(`200 REMOTE | ${url}`);
        } else {
          fail++;
          console.log(`${res.status} REMOTE | ${url}`);
        }
      } catch (err: any) {
        fail++;
        console.log(`ERR REMOTE | ${err.message} | ${url}`);
      }
    }
  }

  console.log(`\nSummary: ${localOk} local images verified, ${remoteOk} remote images verified, ${fail} failed.`);
}

check().finally(() => prisma.$disconnect());
