import { PRODUCTS, CATEGORIES, HERO_SLIDES } from '../prisma/seed';

const urlUsage = new Map<string, string[]>();

for (const c of CATEGORIES) {
  if (c.image) {
    if (!urlUsage.has(c.image)) urlUsage.set(c.image, []);
    urlUsage.get(c.image)!.push(`Category: ${c.name}`);
  }
}

for (const s of HERO_SLIDES) {
  if (s.imageUrl) {
    if (!urlUsage.has(s.imageUrl)) urlUsage.set(s.imageUrl, []);
    urlUsage.get(s.imageUrl)!.push(`Slide: ${s.title}`);
  }
}

for (const p of PRODUCTS) {
  for (const u of p.images.split('|')) {
    const trimmed = u.trim();
    if (trimmed) {
      if (!urlUsage.has(trimmed)) urlUsage.set(trimmed, []);
      urlUsage.get(trimmed)!.push(`[${p.sku}] ${p.name}`);
    }
  }
}

console.log(`Total unique URLs: ${urlUsage.size}`);
let idx = 1;
for (const [url, usages] of urlUsage.entries()) {
  console.log(`${idx++}. ${url}`);
  console.log(`   Used in: ${usages.slice(0, 3).join('; ')}${usages.length > 3 ? ` (+${usages.length - 3} more)` : ''}`);
}
