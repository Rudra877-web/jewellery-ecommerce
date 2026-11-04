import fs from 'fs';
import path from 'path';
import { PRODUCTS } from '../prisma/seed';

async function downloadAll() {
  const dir = path.join(process.cwd(), 'scripts', 'temp_photos');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const urls = new Set<string>();
  for (const p of PRODUCTS) {
    for (const u of p.images.split('|')) {
      if (u.startsWith('http')) urls.add(u.trim());
    }
  }

  console.log(`Downloading ${urls.size} remote images...`);
  let i = 0;
  for (const u of urls) {
    i++;
    const match = u.match(/photo-([a-zA-Z0-9_-]+)/);
    const id = match ? match[0] : `img_${i}`;
    const filePath = path.join(dir, `${id}.jpg`);
    if (!fs.existsSync(filePath)) {
      try {
        const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const buf = await res.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buf));
        console.log(`[${i}/${urls.size}] Downloaded ${id} (${buf.byteLength} bytes)`);
      } catch (err: any) {
        console.error(`Failed ${id}: ${err.message}`);
      }
    } else {
      console.log(`[${i}/${urls.size}] Exists: ${id}`);
    }
  }
  console.log('Finished downloading all!');
}

downloadAll();
