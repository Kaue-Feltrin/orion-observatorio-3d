// Quadros registrados: neutro → três intermediários → apontamento em perspectiva.
export const PERSPECTIVE_FRAMES=Object.freeze([
  {pose:'neutral',file:'/overlay/right-hand-neutral.webp',progress:0},
  {pose:'reach025',file:'/overlay/right-hand-reach-025.webp',progress:.25},
  {pose:'reach050',file:'/overlay/right-hand-reach-050.webp',progress:.5},
  {pose:'reach075',file:'/overlay/right-hand-reach-075.webp',progress:.75},
  {pose:'pointing',file:'/overlay/right-hand-reach-100.webp',progress:1}
]);
export const HAND_REACH_DEPTH=.14;

// Contorno neutro e extensão distal: a base do indicador permanece ancorada.
// Interpolação Hermite monotônica evita as quinas entre colunas lineares.
const COLUMNS=[100,150,180,220,270,320,370,420,480,530];
const NEUTRAL=[[520,540],[486,508],[460,522],[425,516],[401,487],[390,477],[416,510],[439,550],[477,590],[501,620]];
const EXTENDED=[[335,354],[333,402],[344,416],[358,437],[379,463],[399,484],[416,510],[439,550],[477,590],[501,620]];
const CONTOURS=[0,.25,.5,.75,1].map(p=>NEUTRAL.map((point,i)=>
  point.map((y,j)=>y+(EXTENDED[i][j]-y)*p)));
function slopes(values){
  const d=values.slice(1).map((y,i)=>(y-values[i])/(COLUMNS[i+1]-COLUMNS[i]));
  return values.map((_,i)=>{
    if(i===0||i===values.length-1)return 0;
    if(d[i-1]*d[i]<=0)return 0;
    const before=COLUMNS[i]-COLUMNS[i-1],after=COLUMNS[i+1]-COLUMNS[i];
    const a=2*after+before,b=after+2*before;
    return (a+b)/(a/d[i-1]+b/d[i]);
  });
}
const TANGENTS=CONTOURS.map(row=>[0,1].map(j=>slopes(row.map(point=>point[j]))));
// Raiz com mesma tangente em todas as poses: a palma não participa do morph.
for(const row of TANGENTS)for(let j=0;j<2;j++)row[j][COLUMNS.indexOf(370)]=TANGENTS[4][j][COLUMNS.indexOf(370)];
function band(frame,u){
  let i=0;
  while(i<COLUMNS.length-2&&u>COLUMNS[i+1]/1122)i++;
  const width=COLUMNS[i+1]-COLUMNS[i];
  const t=Math.max(0,Math.min(1,(u*1122-COLUMNS[i])/width)),t2=t*t,t3=t2*t;
  const row=CONTOURS[frame],tangents=TANGENTS[frame];
  const y=[0,1].map(j=>(2*t3-3*t2+1)*row[i][j]+(t3-2*t2+t)*width*tangents[j][i]+
    (-2*t3+3*t2)*row[i+1][j]+(t3-t2)*width*tangents[j][i+1]);
  return [1-y[1]/1402,1-y[0]/1402];
}
export function mapPerspectiveIndexV(from,to,u,v){
  if(u>COLUMNS.at(-1)/1122||v<=.54||from===to)return v;
  const [low,high]=band(from,u),[toLow,toHigh]=band(to,u);
  // Faixa de influência estreita abaixo do indicador, longe dos nós dos
  // outros dedos. Mesmo piso nos dois sentidos mantém a reversibilidade.
  const floor=Math.max(.54,Math.min(low,toLow)-Math.max(.005,Math.abs(toLow-low)*.65));
  if(v<=floor)return v;
  if(v<low)return floor+(toLow-floor)*(v-floor)/(low-floor);
  if(v<high)return toLow+(toHigh-toLow)*(v-low)/(high-low);
  return v+toHigh-high;
}

// Só os vizinhos participam: sem acumular cinco imagens durante a transição.
export function perspectiveFrameWeights(progress){
  const p=Math.max(0,Math.min(1,progress)),position=p*4;
  const lower=Math.min(3,Math.floor(position)),fraction=position-lower;
  const blend=fraction*fraction*(3-2*fraction);
  const weights=[0,0,0,0,0];
  weights[lower]=1-blend;weights[lower+1]=blend;
  return weights;
}
