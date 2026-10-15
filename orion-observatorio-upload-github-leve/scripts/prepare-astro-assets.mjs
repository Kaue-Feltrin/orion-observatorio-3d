// Fotografia real da Via Láctea, preparada durante o build.
// Fonte: ESO/S. Brunier — https://www.eso.org/public/images/eso0932a/
// Licença CC BY 4.0 — crédito visível no Observatório. Ajustes: recorte e correção de cor.
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const endpoints = [
  'https://cdn.eso.org/images/large/eso0932a.jpg',
  'https://cdn.eso.org/images/publicationjpg/eso0932a.jpg'
];
let source = null;
const failures = [];
for (const url of endpoints) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const buffer = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || metadata.width < 3000 || !metadata.height || metadata.height < 1500) {
      throw new Error('Imagem menor que o mínimo aceitável');
    }
    source = { buffer, metadata, url };
    break;
  } catch (error) {
    failures.push(url + ': ' + error.message);
  }
}
if (!source) {
  throw new Error('Falha ao obter fotografia da ESO; build interrompido para preservar a versão publicada. ' + failures.join(' | '));
}
const { width: sourceWidth, height: sourceHeight } = source.metadata;
const width = Math.min(5000, sourceWidth);
const height = Math.min(Math.round(width * 0.37), sourceHeight);
const left = Math.floor((sourceWidth - width) / 2);
const top = Math.floor((sourceHeight - height) / 2);
const outputPath = new URL('../public/assets/nebula-eso-photographic.jpg', import.meta.url);
await mkdir(new URL('../public/assets/', import.meta.url), { recursive: true });
const output = await sharp(source.buffer)
  .extract({ left, top, width, height })
  .modulate({ brightness: 1.20, saturation: 1.17 })
  .recomb([[0.98,0.08,0.13], [0.04,0.87,0.14], [0.17,0.15,1.12]])
  .jpeg({ quality: 92, mozjpeg: true })
  .toBuffer();
await writeFile(outputPath, output);
console.log('Nebulosa fotográfica ESO preparada:', width + 'x' + height,
  Math.round(output.length / 1024) + ' KiB', source.url);
