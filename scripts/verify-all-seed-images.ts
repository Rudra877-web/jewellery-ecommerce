import { PRODUCTS, CATEGORIES, HERO_SLIDES } from '../prisma/seed';

console.log('--- CATEGORIES ---');
CATEGORIES.forEach(c => console.log(`${c.slug}: ${c.image}`));

console.log('\n--- HERO SLIDES ---');
HERO_SLIDES.forEach(s => console.log(`${s.title}: ${s.imageUrl}`));

console.log('\n--- PRODUCTS ---');
PRODUCTS.forEach((p, i) => {
  console.log(`${i+1}. [${p.sku}] ${p.name} (${p.categorySlug}) => ${p.images}`);
});
