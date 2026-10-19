// Confirmação do clique antes da viagem: mesmo loop, sem imagens novas.
import * as THREE from 'three';

const clamp=x=>Math.max(0,Math.min(1,x));
// Curva C2: velocidade e aceleração chegam a zero nos encontros das fases.
const smooth=(x,a,b)=>{const t=clamp((x-a)/(b-a));return clamp(t*t*t*(t*(t*6-15)+10));};
export const SELECTION_DURATION=.84;
export const REDUCED_SELECTION_DURATION=.16;

export function sampleStarSelection(elapsed,reducedMotion=false){
  const progress=clamp(elapsed/(reducedMotion?REDUCED_SELECTION_DURATION:SELECTION_DURATION));
  if(reducedMotion)return {progress,reach:0,press:0,anticipation:0,followThrough:0,light:progress<1?.30:0};
  const anticipation=smooth(progress,0,.07)*(1-smooth(progress,.09,.20));
  const reach=smooth(progress,.08,.36)*(1-smooth(progress,.72,1));
  const press=smooth(progress,.28,.48)*(1-smooth(progress,.55,.86));
  const followThrough=smooth(progress,.55,.72)*(1-smooth(progress,.78,1));
  const light=smooth(progress,0,.25)*(1-smooth(progress,.65,1))*(.75+.25*press);
  return {progress,reach,press,anticipation,followThrough,light};
}

export function createStarSelection(star,{camera,hands,reducedMotion=false,onConfirm}){
  const state={active:false,completed:false,elapsed:0,progress:0,reach:0,press:0,
    anticipation:0,followThrough:0,light:0,activations:0};
  const root=new THREE.Group();root.name='NoxSelectionLight';root.visible=false;star.add(root);
  const rings=[],orientation=new THREE.Quaternion(),cameraOrientation=new THREE.Quaternion();
  let geometry=null,disposed=false,pendingReducedFrame=false;
  function prepare(){
    if(geometry)return;
    // Faixa com bordas suaves por alpha nos vértices. Sem textura ou bloom novo.
    geometry=new THREE.RingGeometry(.86,1,96,4);
    const positions=geometry.attributes.position,colors=new Float32Array(positions.count*4);
    for(let i=0;i<positions.count;i++){
      const radius=Math.hypot(positions.getX(i),positions.getY(i));
      colors.set([1,1,1,Math.sin(Math.PI*clamp((radius-.86)/.14))**2],i*4);
    }
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));
    for(const color of [0xf5dda8,0xb9a5ef]){
      const material=new THREE.MeshBasicMaterial({color,vertexColors:true,transparent:true,
        opacity:0,side:THREE.DoubleSide,depthTest:false,depthWrite:false,
        blending:THREE.AdditiveBlending,toneMapped:false,forceSinglePass:true});
      const ring=new THREE.Mesh(geometry,material);ring.renderOrder=15;
      ring.frustumCulled=false;root.add(ring);rings.push(ring);
    }
  }
  function begin(){
    if(disposed||state.active||state.completed)return false;
    prepare();state.active=true;state.activations++;root.visible=true;
    hands.setStarSelection?.({reach:0,press:0});
    update(0);pendingReducedFrame=reducedMotion;return true;
  }
  function update(delta){
    if(!state.active||disposed)return;
    // Mesmo em um quadro lento, a confirmação estática precisa ser desenhada
    // ao menos uma vez antes de iniciar a viagem acessível.
    if(pendingReducedFrame){pendingReducedFrame=false;delta=0;}
    // Compilação inicial/quadros lentos não podem pular todo o gesto.
    // A 10 FPS ou mais, a duração continua sendo 840 ms.
    state.elapsed+=Math.max(0,reducedMotion?delta:Math.min(delta,.10));
    Object.assign(state,sampleStarSelection(state.elapsed,reducedMotion));
    hands.setStarSelection?.({reach:state.reach,press:state.press,
      anticipation:state.anticipation,followThrough:state.followThrough});
    star.getWorldQuaternion(orientation);camera.getWorldQuaternion(cameraOrientation);
    root.quaternion.copy(orientation.invert().multiply(cameraOrientation));
    for(let i=0;i<rings.length;i++){
      // Resposta imediata na primeira onda; segunda acompanha a pressão.
      const delay=i*.30,p=clamp((state.progress-delay)/(1-delay));
      const radius=reducedMotion?20:12+42*(1-(1-p)**2);
      rings[i].scale.setScalar(radius);
      rings[i].material.opacity=reducedMotion?(i===0?state.light:0):
        (i===0?.42:.24)*smooth(p,0,.16)*(1-smooth(p,.4,1));
    }
    if(state.progress>=1){
      state.active=false;state.completed=true;root.visible=false;
      // A retirada normal das mãos começa somente depois da confirmação.
      hands.setStarSelection?.(null);onConfirm();
    }
  }
  function dispose(){
    if(disposed)return;disposed=true;state.active=false;root.visible=false;
    hands.setStarSelection?.(null);geometry?.dispose();
    for(const ring of rings)ring.material.dispose();star.remove(root);
  }
  return {state,root,rings,begin,update,dispose};
}
