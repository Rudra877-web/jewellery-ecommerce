import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Applying Semantic, Name-Aware Image Matching ---');

  const products = await prisma.product.findMany();
  let updatedCount = 0;

  for (const p of products) {
    const nameLower = p.name.toLowerCase();
    const sku = p.sku.toUpperCase();
    let correctImage: string | null = null;

    // 1. Bangles & Bracelets specific semantic matching
    if (nameLower.includes('tennis') || (nameLower.includes('bracelet') && nameLower.includes('diamond'))) {
      if (sku.includes('205') || sku.includes('002')) {
        correctImage = '/products/diamond-tennis-bracelet.jpg';
      } else {
        correctImage = '/products/bracelet-diamond-line.jpg';
      }
    } else if (nameLower.includes('charm bracelet') || nameLower.includes('snake chain')) {
      correctImage = '/products/bracelet-silver-charm.jpg';
    } else if (nameLower.includes('peacock') && (nameLower.includes('kada') || nameLower.includes('bangle'))) {
      correctImage = '/products/antique-gold-kadas.jpg';
    } else if (nameLower.includes('nakshi') || nameLower.includes('antique gold kada') || nameLower.includes('carved gold kada')) {
      correctImage = '/products/bangles-gold-nakshi-pair.jpg';
    } else if (nameLower.includes('meenakari') && (nameLower.includes('cuff') || nameLower.includes('bangle') || nameLower.includes('kada'))) {
      correctImage = '/products/bangles-meenakari-cuff.jpg';
    } else if (nameLower.includes('bangle set') || nameLower.includes('sleek bangle')) {
      if (sku.includes('207') || sku.includes('113')) {
        correctImage = '/products/gold-bangles-set.jpg';
      } else {
        correctImage = '/products/bangles-everyday-sleek.jpg';
      }
    } else if (nameLower.includes('kada') || nameLower.includes('gokhru')) {
      correctImage = '/products/gold-kada-bangle.jpg';
    }

    // 2. Solitaires specific semantic matching
    else if (nameLower.includes('cushion')) {
      correctImage = '/products/cushion-solitaire-ring.jpg';
    } else if (nameLower.includes('emerald cut') && (nameLower.includes('solitaire') || nameLower.includes('ring'))) {
      correctImage = '/products/emerald-cut-solitaire.jpg';
    } else if (nameLower.includes('princess cut') || nameLower.includes('radiant')) {
      correctImage = '/products/solitaire-princess-cut.jpg';
    } else if (nameLower.includes('oval') && nameLower.includes('solitaire')) {
      correctImage = '/products/solitaire-oval-brilliant.jpg';
    } else if (nameLower.includes('solitaire') && (nameLower.includes('stud') || nameLower.includes('earring'))) {
      correctImage = '/products/solitaire-diamond-studs.jpg';
    } else if (nameLower.includes('solitaire') && (nameLower.includes('ring') || nameLower.includes('engagement'))) {
      correctImage = '/products/solitaire-diamond-ring.jpg';
    }

    // 3. Rings semantic matching
    else if (nameLower.includes('floral') && nameLower.includes('ring')) {
      correctImage = '/products/gold-floral-ring.jpg';
    } else if (nameLower.includes('kundan') && nameLower.includes('ring')) {
      correctImage = '/products/kundan-polki-ring.jpg';
    } else if (nameLower.includes('ruby') && nameLower.includes('ring')) {
      correctImage = '/products/ring-ruby-halo.jpg';
    } else if (nameLower.includes('eternity') || nameLower.includes('diamond band')) {
      correctImage = '/products/ring-diamond-eternity.jpg';
    } else if (nameLower.includes('platinum') && nameLower.includes('ring')) {
      correctImage = '/products/ring-platinum-band.jpg';
    }

    // 4. Earrings semantic matching
    else if (nameLower.includes('chandbali')) {
      correctImage = '/products/meenakari-chandbali.jpg';
    } else if (nameLower.includes('jhumka')) {
      if (nameLower.includes('dome') || nameLower.includes('traditional')) {
        correctImage = '/products/traditional-gold-jhumka.jpg';
      } else {
        correctImage = '/products/floral-jhumka.jpg';
      }
    } else if (nameLower.includes('sui dhaga') || nameLower.includes('threader')) {
      correctImage = '/products/earrings-sui-dhaga.jpg';
    } else if (nameLower.includes('chandelier') || (nameLower.includes('emerald') && nameLower.includes('earring'))) {
      correctImage = '/products/earrings-emerald-chandelier.jpg';
    }

    // 5. Necklaces & Mangalsutra semantic matching
    else if (nameLower.includes('mangalsutra')) {
      if (nameLower.includes('modern') || nameLower.includes('diamond')) {
        correctImage = '/products/diamond-mangalsutra.jpg';
      } else {
        correctImage = '/products/traditional-mangalsutra.jpg';
      }
    } else if (nameLower.includes('padmavati') || nameLower.includes('temple haaram')) {
      correctImage = '/products/padmavati-temple-haaram.jpg';
    } else if (nameLower.includes('choker') && nameLower.includes('emerald')) {
      correctImage = '/products/polki-emerald-choker.jpg';
    } else if (nameLower.includes('kundan') && nameLower.includes('choker')) {
      correctImage = '/products/royal-kundan-necklace.jpg';
    } else if (nameLower.includes('pearl') && (nameLower.includes('choker') || nameLower.includes('necklace'))) {
      correctImage = '/products/necklace-pearl-choker.jpg';
    } else if (nameLower.includes('haaram') || nameLower.includes('mala')) {
      correctImage = '/products/gold-temple-haaram.jpg';
    }

    if (correctImage && correctImage !== p.images) {
      await prisma.product.update({
        where: { id: p.id },
        data: { images: correctImage },
      });
      console.log(`✓ Fixed [${p.sku}] "${p.name}" -> ${correctImage}`);
      updatedCount++;
    }
  }

  console.log(`\nDone! Successfully corrected ${updatedCount} products with exact semantic images.`);
}

main().finally(() => prisma.$disconnect());

