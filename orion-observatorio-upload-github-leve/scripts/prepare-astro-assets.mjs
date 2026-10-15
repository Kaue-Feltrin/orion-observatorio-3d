// Projeto Órion · Fotografia ESO preparada offline, sem trabalho extra na GPU.
// Fonte: ESO/S. Brunier — https://www.eso.org/public/images/eso0932a/
// CC BY 4.0, crédito visível no Observatório. Derivação artística declarada:
// recorte, tratamento de cor, supressão de estrelas pequenas e céu periférico vazio.
// O JPEG original remoto NÃO é substituído: apenas criamos outra versão para o site.
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const endpoints=[
  'https://cdn.eso.org/images/large/eso0932a.jpg',
  'https://cdn.eso.org/images/publicationjpg/eso0932a.jpg',
];
let source=null;
const failures=[];
for(const url of endpoints){
  try{
    const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw new Error('HTTP '+response.status);
    const buffer=Buffer.from(await response.arrayBuffer());
    const metadata=await sharp(buffer).metadata();
    if(!metadata.width||metadata.width<3000||!metadata.height||metadata.height<1500)
      throw new Error('Imagem menor que o mínimo aceitável');
    source={buffer,metadata,url};
    break;
  }catch(error){failures.push(url+': '+error.message);}
}
if(!source)throw new Error(
  'Falha ao obter fotografia da ESO; build interrompido para não publicar imagem incorreta. '+
  failures.join(' | ')
);

const {width:sourceWidth,height:sourceHeight}=source.metadata;
const width=Math.min(5000,sourceWidth);
const height=Math.min(Math.round(width*.37),sourceHeight);
const left=Math.floor((sourceWidth-width)/2);
const top=Math.floor((sourceHeight-height)/2);

// Remover ESTRELAS NA FOTOGRAFIA, não apenas a poeira da cena Three.js:
// a mediana diminui pontos pequenos enquanto mantém estruturas de nuvens.
// Tudo acontece no build. Durante a visita o navegador carrega um só JPEG.
const {data,info}=await sharp(source.buffer)
  .extract({left,top,width,height})
  .modulate({brightness:1.20,saturation:1.17})
  .recomb([[.98,.08,.13],[.04,.87,.14],[.17,.15,1.12]])
  .median(7)
  .removeAlpha()
  .raw()
  .toBuffer({resolveWithObject:true});
if(info.channels!==3||info.width!==width||info.height!==height)
  throw new Error('Imagem inesperada ao montar céu sem estrelas');

// Guardar a faixa nebular num recorte orgânico. As zonas acima e abaixo
// transitam gradualmente para espaço escuro; não reintroduzir pontinhos
// usando um skybox ou outra textura estelar atrás da fotografia.
const night=[2,2,8];
for(let y=0;y<height;y++){
  const ny=y/Math.max(1,height-1);
  for(let x=0;x<width;x++){
    const nx=x/Math.max(1,width-1);
    const center=.526+.014*Math.sin((nx-.30)*Math.PI*.8);
    const band=.10+.022*Math.exp(-Math.pow((nx-.52)/.30,2));
    const distance=Math.abs(ny-center);
    const fade=Math.max(0,Math.min(1,(distance-band)/.19));
    const eased=fade*fade*(3-2*fade);
    const preserve=1-eased;
    const i=(y*width+x)*3;
    for(let c=0;c<3;c++)
      data[i+c]=Math.round(night[c]+(data[i+c]-night[c])*preserve);
  }
}
const output=await sharp(data,{raw:{width,height,channels:3}})
  .jpeg({quality:90,mozjpeg:true})
  .toBuffer();
const outputPath=new URL('../public/assets/nebula-eso-photographic.jpg',import.meta.url);
await mkdir(new URL('../public/assets/',import.meta.url),{recursive:true});
await writeFile(outputPath,output);
console.log('ESO: faixa de nebulosa preservada, céu periférico sem estrelas:',
  width+'x'+height,Math.round(output.length/1024)+' KiB',source.url);
