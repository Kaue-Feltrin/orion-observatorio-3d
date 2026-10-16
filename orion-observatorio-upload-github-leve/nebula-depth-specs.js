// Regiões reais da fotografia ESO. Coordenadas UV normalizadas sobre
// o mesmo recorte 5000×1850: não duplicar o panorama inteiro.
// v0.9.8: paralaxe óptica mais responsiva, proporcional à
// distância de cada plano. Os valores estão em unidades 3D, não em pixels.
// Deslocamento 3D de maior amplitude em véus de baixa opacidade; nenhuma
// textura adicional, shader novo ou alteração na foto principal.
export const nebulaDepthSpecs=Object.freeze([
  {id:'01',name:'Massa distante',u:.19,v:.51,w:.23,h:.27,z:-425,opacity:.18,rate:.27,phase:.6,drift:1.5,parallaxX:2.2,parallaxY:.8},
  {id:'02',name:'Nuvem central',u:.41,v:.52,w:.25,h:.32,z:-342,opacity:.23,rate:.22,phase:1.9,drift:2.1,parallaxX:5.2,parallaxY:2.1},
  {id:'03',name:'Filamento lateral',u:.61,v:.53,w:.23,h:.30,z:-252,opacity:.19,rate:.30,phase:3.0,drift:2.9,parallaxX:9.0,parallaxY:3.1},
  {id:'04',name:'Véu avançado',u:.80,v:.53,w:.22,h:.26,z:-185,opacity:.14,rate:.36,phase:4.2,drift:3.6,parallaxX:16.5,parallaxY:6.2},
]);
