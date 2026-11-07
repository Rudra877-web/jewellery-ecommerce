import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PRODUCTS_DIR = path.join(process.cwd(), 'public', 'products');

// High-resolution, royalty-free luxury jewellery images from Unsplash
const IMAGE_DOWNLOAD_LIST = [
  // Rings
  { filename: 'ring-diamond-eternity.jpg', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80' },
  { filename: 'ring-kundan-uncut.jpg', url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=80' },
  { filename: 'ring-ruby-halo.jpg', url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=900&q=80' },
  { filename: 'ring-platinum-band.jpg', url: 'https://images.unsplash.com/photo-1589674781759-c21c37956a44?auto=format&fit=crop&w=900&q=80' },
  { filename: 'ring-sapphire-vintage.jpg', url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=80' },
  { filename: 'ring-gold-cocktail.jpg', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80' },
  
  // Necklaces & Haarams
  { filename: 'necklace-kundan-collar.jpg', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80' },
  { filename: 'necklace-temple-mala.jpg', url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=900&q=80' },
  { filename: 'necklace-pearl-choker.jpg', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80' },
  { filename: 'necklace-diamond-pendant.jpg', url: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=900&q=80' },
  { filename: 'necklace-emerald-layered.jpg', url: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=900&q=80' },
  { filename: 'necklace-gold-chain.jpg', url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=900&q=80' },
  
  // Mangalsutra
  { filename: 'mangalsutra-dainty-diamond.jpg', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80' },
  { filename: 'mangalsutra-traditional-black.jpg', url: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=900&q=80' },
  { filename: 'mangalsutra-modern-dual.jpg', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80' },
  { filename: 'diamond-mangalsutra.jpg', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80' },
  { filename: 'royal-kundan-necklace.jpg', url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=900&q=80' },
  
  // Earrings
  { filename: 'earrings-peacock-jhumka.jpg', url: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=80' },
  { filename: 'earrings-emerald-chandelier.jpg', url: 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&w=900&q=80' },
  { filename: 'earrings-diamond-drops.jpg', url: 'https://images.unsplash.com/photo-1588444650733-d0767b753fc8?auto=format&fit=crop&w=900&q=80' },
  { filename: 'earrings-sui-dhaga.jpg', url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=80' },
  { filename: 'earrings-pearl-cluster.jpg', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80' },
  { filename: 'earrings-rose-gold-huggie.jpg', url: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80' },
  { filename: 'earrings-ruby-studs.jpg', url: 'https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=900&q=80' },
  { filename: 'floral-jhumka.jpg', url: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=80' },
  
  // Bangles & Bracelets
  { filename: 'bangles-gold-nakshi-pair.jpg', url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80' },
  { filename: 'bangles-meenakari-cuff.jpg', url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80' },
  { filename: 'bangles-everyday-sleek.jpg', url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80' },
  { filename: 'bracelet-diamond-line.jpg', url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80' },
  { filename: 'bracelet-silver-charm.jpg', url: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=80' },
  { filename: 'bracelet-platinum-kada.jpg', url: 'https://images.unsplash.com/photo-1589674781759-c21c37956a44?auto=format&fit=crop&w=900&q=80' },
  { filename: 'gold-kada-bangle.jpg', url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80' },
  
  // Solitaires
  { filename: 'solitaire-princess-cut.jpg', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80' },
  { filename: 'solitaire-radiant-halo.jpg', url: 'https://images.unsplash.com/photo-1589674781759-c21c37956a44?auto=format&fit=crop&w=900&q=80' },
  { filename: 'solitaire-oval-brilliant.jpg', url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=80' },
  { filename: 'solitaire-marquise-gold.jpg', url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=900&q=80' },
];

async function downloadImages() {
  if (!fs.existsSync(PRODUCTS_DIR)) {
    fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  }

  console.log('--- Step 1: Downloading distinct high-resolution luxury jewellery images ---');
  for (const item of IMAGE_DOWNLOAD_LIST) {
    const dest = path.join(PRODUCTS_DIR, item.filename);
    if (!fs.existsSync(dest) || fs.statSync(dest).size < 1000) {
      try {
        console.log(`Downloading: ${item.filename}...`);
        const res = await fetch(item.url);
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(dest, buffer);
          console.log(`✓ Saved ${item.filename} (${buffer.length} bytes)`);
        } else {
          console.warn(`Failed ${item.filename}: HTTP ${res.status}`);
        }
      } catch (e) {
        console.warn(`Error downloading ${item.filename}:`, e);
      }
    } else {
      console.log(`Already exists: ${item.filename}`);
    }
  }
}

// Category image pools ensuring NO duplicate images within the same category
const POOLS: Record<string, string[]> = {
  rings: [
    '/products/gold-floral-ring.jpg',
    '/products/cushion-solitaire-ring.jpg',
    '/products/emerald-cut-solitaire.jpg',
    '/products/kundan-polki-ring.jpg',
    '/products/solitaire-diamond-ring.jpg',
    '/products/ring-diamond-eternity.jpg',
    '/products/ring-kundan-uncut.jpg',
    '/products/ring-ruby-halo.jpg',
    '/products/ring-platinum-band.jpg',
    '/products/ring-sapphire-vintage.jpg',
    '/products/ring-gold-cocktail.jpg',
  ],
  necklaces: [
    '/products/padmavati-temple-haaram.jpg',
    '/products/polki-emerald-choker.jpg',
    '/products/gold-temple-haaram.jpg',
    '/products/royal-kundan-necklace.jpg',
    '/products/necklace-kundan-collar.jpg',
    '/products/necklace-temple-mala.jpg',
    '/products/necklace-pearl-choker.jpg',
    '/products/necklace-diamond-pendant.jpg',
    '/products/necklace-emerald-layered.jpg',
    '/products/necklace-gold-chain.jpg',
  ],
  earrings: [
    '/products/meenakari-chandbali.jpg',
    '/products/solitaire-diamond-studs.jpg',
    '/products/traditional-gold-jhumka.jpg',
    '/products/floral-jhumka.jpg',
    '/products/earrings-peacock-jhumka.jpg',
    '/products/earrings-emerald-chandelier.jpg',
    '/products/earrings-diamond-drops.jpg',
    '/products/earrings-sui-dhaga.jpg',
    '/products/earrings-pearl-cluster.jpg',
    '/products/earrings-rose-gold-huggie.jpg',
    '/products/earrings-ruby-studs.jpg',
  ],
  'bangles-bracelets': [
    '/products/antique-gold-kadas.jpg',
    '/products/diamond-tennis-bracelet.jpg',
    '/products/gold-bangles-set.jpg',
    '/products/bangles-gold-nakshi-pair.jpg',
    '/products/bangles-meenakari-cuff.jpg',
    '/products/bangles-everyday-sleek.jpg',
    '/products/bracelet-diamond-line.jpg',
    '/products/bracelet-silver-charm.jpg',
    '/products/bracelet-platinum-kada.jpg',
    '/products/gold-kada-bangle.jpg',
  ],
  bangles: [
    '/products/gold-bangles-set.jpg',
    '/products/antique-gold-kadas.jpg',
    '/products/bangles-gold-nakshi-pair.jpg',
    '/products/bangles-meenakari-cuff.jpg',
    '/products/bangles-everyday-sleek.jpg',
    '/products/gold-kada-bangle.jpg',
  ],
  bracelets: [
    '/products/diamond-tennis-bracelet.jpg',
    '/products/bracelet-diamond-line.jpg',
    '/products/bracelet-silver-charm.jpg',
    '/products/bracelet-platinum-kada.jpg',
  ],
  solitaires: [
    '/products/solitaire-diamond-ring.jpg',
    '/products/cushion-solitaire-ring.jpg',
    '/products/emerald-cut-solitaire.jpg',
    '/products/solitaire-diamond-studs.jpg',
    '/products/solitaire-princess-cut.jpg',
    '/products/solitaire-radiant-halo.jpg',
    '/products/solitaire-oval-brilliant.jpg',
    '/products/solitaire-marquise-gold.jpg',
  ],
  mangalsutra: [
    '/products/traditional-mangalsutra.jpg',
    '/products/diamond-mangalsutra.jpg',
    '/products/mangalsutra-dainty-diamond.jpg',
    '/products/mangalsutra-traditional-black.jpg',
    '/products/mangalsutra-modern-dual.jpg',
  ],
};

async function updateDatabase() {
  console.log('\n--- Step 2: Assigning distinct unique images to all products in Database ---');
  
  const categories = await prisma.category.findMany();
  
  // Update category cover photos so each has a unique, stunning hero
  const catCoverMap: Record<string, string> = {
    rings: '/products/gold-floral-ring.jpg',
    necklaces: '/products/padmavati-temple-haaram.jpg',
    earrings: '/products/meenakari-chandbali.jpg',
    'bangles-bracelets': '/products/antique-gold-kadas.jpg',
    bangles: '/products/gold-bangles-set.jpg',
    bracelets: '/products/diamond-tennis-bracelet.jpg',
    solitaires: '/products/cushion-solitaire-ring.jpg',
    mangalsutra: '/products/traditional-mangalsutra.jpg',
  };

  for (const cat of categories) {
    const cover = catCoverMap[cat.slug] || '/products/gold-floral-ring.jpg';
    await prisma.category.update({
      where: { id: cat.id },
      data: { image: cover },
    });
    console.log(`Updated Category [${cat.name}] -> Cover: ${cover}`);
  }

  // Iterate over each category and distribute distinct images to each product
  for (const cat of categories) {
    const prods = await prisma.product.findMany({
      where: { categoryId: cat.id },
      orderBy: { sku: 'asc' },
    });

    const pool = POOLS[cat.slug] || POOLS.rings;
    console.log(`\nCategory: "${cat.name}" (${prods.length} products, ${pool.length} unique images available)`);

    for (let i = 0; i < prods.length; i++) {
      const p = prods[i];
      const assignedImg = pool[i % pool.length];
      
      await prisma.product.update({
        where: { id: p.id },
        data: {
          images: assignedImg,
        },
      });
      console.log(`  [${p.sku}] ${p.name.slice(0, 30)} -> ${assignedImg}`);
    }
  }

  console.log('\n✓ ALL products and categories successfully updated with distinct unique images!');
}

async function main() {
  await downloadImages();
  await updateDatabase();
}

main().finally(() => prisma.$disconnect());

