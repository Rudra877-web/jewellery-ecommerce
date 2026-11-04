import fs from 'fs';
import path from 'path';

async function testDownload() {
  const url = 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=600&q=80';
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(path.join(process.cwd(), 'public', 'test-check.jpg'), Buffer.from(buffer));
  console.log('Saved test-check.jpg, size:', buffer.byteLength);
}

testDownload();
