// Quadros registrados: neutro → três intermediários → apontamento em perspectiva.
export const PERSPECTIVE_FRAMES=Object.freeze([
  {pose:'neutral',file:'/overlay/right-hand-neutral.webp',progress:0},
  {pose:'reach025',file:'/overlay/right-hand-reach-025.webp',progress:.25},
  {pose:'reach050',file:'/overlay/right-hand-reach-050.webp',progress:.5},
  {pose:'reach075',file:'/overlay/right-hand-reach-075.webp',progress:.75},
  {pose:'pointing',file:'/overlay/right-hand-reach-100.webp',progress:1}
]);
export const HAND_REACH_DEPTH=.14;

// Contornos baseados nas bordas alpha das artes (canvas de referência).
// A raiz converge gradualmente para a palma; copiar o contorno neutro
// nessa junção criava um calombo no indicador estendido.
const COLUMNS=[150,180,220,270,320,370,420,480,530];
const CONTOURS=[
  [[490,503],[461,522],[427,518],[402,489],[389,478],[380,475],[401,496],[455,550],[493,588]],
  [[408,434],[408,434],[388,454],[366,451],[374,459],[392,476],[418,510],[455,550],[493,588]],
  [[332,398],[332,398],[343,429],[366,448],[388,483],[417,508],[440,535],[470,565],[493,588]],
  [[329,388],[329,388],[339,428],[368,458],[396,484],[418,513],[440,540],[470,565],[493,588]],
  [[352,393],[352,393],[356,437],[382,472],[407,501],[428,523],[450,550],[475,570],[493,588]]
];

function band(frame,u){
  let i=0;
  while(i<COLUMNS.length-2&&u>COLUMNS[i+1]/1122)i++;
  const t=Math.max(0,Math.min(1,(u*1122-COLUMNS[i])/(COLUMNS[i+1]-COLUMNS[i])));
  const a=CONTOURS[frame][i],b=CONTOURS[frame][i+1];
  return [1-(a[1]+(b[1]-a[1])*t)/1402,1-(a[0]+(b[0]-a[0])*t)/1402];
}
export function mapPerspectiveIndexV(from,to,u,v){
  if(u>COLUMNS.at(-1)/1122||v<=.54||from===to)return v;
  const [low,high]=band(from,u),[toLow,toHigh]=band(to,u);
  if(v<low)return .54+(toLow-.54)*(v-.54)/(low-.54);
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
