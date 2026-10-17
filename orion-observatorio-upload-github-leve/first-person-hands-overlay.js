// Observatório v0.9.18 · Mãos etéreas 2,5D (uma imagem, duas metades).
// A composição aprovada é imutável: sem skinning, deformação ou novos shaders.
// Ambas as metades usam o MESMO WebP, carregado localmente e compartilhado.
const SPRITE='/overlay/orion-hands-frame.webp';

export function createEtherealHandsOverlay(host,{enabled=true,reducedMotion=false}={}){
  const state={
    enabled:!!enabled, visible:!!enabled, loaded:false,
    mode:'overlay', motionEnabled:!reducedMotion, loadError:null,
    drawSurfaces:0, triangles:0, textureCount:0, joints:0, fingerJoints:0,
    swayX:0, swayY:0, elementCount:0
  };
  if(!enabled)return{state,meshes:[],ready:Promise.resolve(false),
    update(){},resize(){},beginTravel(){},dispose(){}};

  const layer=document.createElement('div');
  layer.id='orionEtherealHands';
  layer.className='orion-ethereal-hands';
  layer.setAttribute('aria-hidden','true');
  const wrappers=[];
  for(const side of ['left','right']){
    const wrapper=document.createElement('div');
    wrapper.className='orion-ethereal-hand orion-ethereal-hand--'+side;
    wrapper.dataset.side=side;
    const img=document.createElement('img');
    img.src=SPRITE;img.alt='';
    img.decoding='async';img.loading='eager';img.draggable=false;
    wrapper.appendChild(img);
    layer.appendChild(wrapper);
    wrappers.push(wrapper);
  }
  host.appendChild(layer);
  state.elementCount=2;
  let disposed=false,x=0,y=0;
  const asset=new Image();
  asset.decoding='async';
  const ready=new Promise(resolve=>{
    asset.onload=()=>{if(disposed)return resolve(false);
      state.loaded=true;state.textureCount=1;
      layer.classList.add('is-ready');resolve(true);
    };
    asset.onerror=()=>{if(disposed)return resolve(false);
      state.loadError='Falha ao carregar mãos etéreas locais';layer.remove();
      resolve(false);
    };
    asset.src=SPRITE;
    if(asset.complete && asset.naturalWidth>0)asset.onload();
  });
  function update(time,dt,mx=0,my=0){
    if(disposed||!state.visible||!state.loaded)return;
    const step=Math.min(Math.max(dt,0),.06);
    const smoothing=state.motionEnabled?1-Math.exp(-step*6.2):1;
    x+=(Math.max(-1,Math.min(1,mx))-x)*smoothing;
    y+=(Math.max(-1,Math.min(1,my))-y)*smoothing;
    state.swayX=state.motionEnabled?x:0;
    state.swayY=state.motionEnabled?y:0;
    const breath=state.motionEnabled?Math.sin(time*.92)*2.0:0;
    // Movimentos subpixel/curtos: mãos NÃO dobram, não mudam sua silhueta.
    for(let i=0;i<wrappers.length;i++){
      const side=i===0?1:-1;
      const hx=state.swayX*(i===0?-5.5:-5.2)+side*.6*Math.sin(time*.37);
      const hy=state.swayY*(-3.8)+(i===0?breath:breath*.85);
      const roll=state.motionEnabled?state.swayX*(i===0?-.23:.23):0;
      const tx=state.motionEnabled?hx:0,ty=state.motionEnabled?hy:0;
      wrappers[i].style.transform=
        'translate3d('+tx.toFixed(2)+'px,'+ty.toFixed(2)+'px,0) rotate('+roll.toFixed(3)+'deg)';
    }
  }
  function beginTravel(){
    if(!state.visible)return;
    state.visible=false;
    layer.classList.add('is-leaving');
  }
  function resize(){/* estilos em vh; não há matriz de câmera a recalibrar */}
  function dispose(){
    disposed=true;state.visible=false;
    asset.onload=null;asset.onerror=null;
    layer.remove();
  }
  return{state,meshes:[],ready,update,resize,beginTravel,dispose,layer};
}
