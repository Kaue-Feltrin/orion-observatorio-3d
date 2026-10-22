// Fotografia real da Via Láctea, preparada durante o build.
// Fonte: ESO/S. Brunier — https://www.eso.org/public/images/eso0932a/
// Licença CC BY 4.0 — crédito visível no Observatório. Ajustes: recorte e correção de cor.
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { nebulaDepthSpecs } from '../nebula-depth-specs.js';

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


// Os recortes abaixo são derivados do JPEG ESO ORIGINAL, antes de
// publicar. A fotografia integral permanece idêntica à v0.9.2d.
// Somente as sobreposições são suavizadas, nunca a imagem de fundo.
const assetRoot=new URL('../public/assets/depth/',import.meta.url);
await mkdir(assetRoot,{recursive:true});
for(const spec of nebulaDepthSpecs){
  const cropWidth=Math.max(1,Math.round(width*spec.w));
  const cropHeight=Math.max(1,Math.round(height*spec.h));
  const left=Math.max(0,Math.min(width-cropWidth,Math.round(width*(spec.u-spec.w/2))));
  const top=Math.max(0,Math.min(height-cropHeight,Math.round(height*(spec.v-spec.h/2))));
  const outputWidth=Math.min(800,cropWidth);
  const {data,info}=await sharp(output)
    .extract({left,top,width:cropWidth,height:cropHeight})
    .resize({width:outputWidth,withoutEnlargement:true})
    .median(3).blur(1.5).removeAlpha().raw()
    .toBuffer({resolveWithObject:true});
  const rgba=Buffer.alloc(info.width*info.height*4);
  for(let y=0;y<info.height;y++){
    const vy=(y+.5)/info.height-.5;
    for(let x=0;x<info.width;x++){
      const vx=(x+.5)/info.width-.5;
      const i=(y*info.width+x)*3;
      const r=data[i],g=data[i+1],b=data[i+2];
      const lum=(r+g+b)/765;
      // Borda recortada como gás orgânico sem retângulo aparente.
      const irregular=1+.085*Math.sin(10*vx+spec.phase)+.05*Math.sin(13*vy+2*vx);
      const radius=Math.hypot(vx/.50,vy/.47)*irregular;
      const edge=Math.max(0,Math.min(1,(1-radius)/.47));
      const feather=edge*edge*(3-2*edge);
      const cloud=Math.max(0,Math.min(1,(lum-.065)/.36));
      const alpha=feather*Math.sqrt(cloud)*.83;
      const o=(y*info.width+x)*4;
      rgba[o]=r;rgba[o+1]=g;rgba[o+2]=b;
      rgba[o+3]=Math.round(alpha*255);
    }
  }
  const fragment=await sharp(rgba,{raw:{width:info.width,height:info.height,channels:4}})
    .webp({quality:74,alphaQuality:83,effort:5})
    .toBuffer();
  const destination=new URL('eso-gas-'+spec.id+'.webp',assetRoot);
  await writeFile(destination,fragment);
  console.log('Recorte volumétrico ESO',spec.id,info.width+'x'+info.height,
    Math.round(fragment.length/1024)+' KiB');
}
