// Confirmação astral localizada na Nox; mesmo loop, sem imagens novas.
import * as THREE from 'three';

const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=(x,a,b)=>{const t=clamp((x-a)/(b-a));return clamp(t*t*t*(t*(t*6-15)+10));};
export const SELECTION_DURATION=1.12;
export const REDUCED_SELECTION_DURATION=.16;
export const SELECTION_DEPARTURE=.78;

export function sampleStarSelection(elapsed,reducedMotion=false){
  const progress=clamp(elapsed/(reducedMotion?REDUCED_SELECTION_DURATION:SELECTION_DURATION));
  if(reducedMotion)return {progress,reach:0,press:0,anticipation:0,followThrough:0,lift:0,charge:0,burst:0,light:progress<1?.30:0};
  const anticipation=smooth(progress,0,.07)*(1-smooth(progress,.10,.24));
  const reach=smooth(progress,.08,.40)*(1-smooth(progress,.68,1));
  const lift=smooth(progress,.05,.28)*(1-smooth(progress,.57,.94));
  const press=smooth(progress,.32,.49)*(1-smooth(progress,.60,.88));
  const followThrough=smooth(progress,.60,.78)*(1-smooth(progress,.86,1));
  const charge=smooth(progress,0,.34)*(1-smooth(progress,.44,.64));
  const burst=smooth(progress,.32,.49)*(1-smooth(progress,.60,.98));
  const light=1-(1-.65*charge)*(1-.95*burst);
  return {progress,reach,press,anticipation,followThrough,lift,charge,burst,light};
}

function featheredRing(inner,segments,arc=Math.PI*2){
  const geometry=new THREE.RingGeometry(inner,1,segments,4,0,arc);
  const positions=geometry.attributes.position;
  const colors=new Float32Array(positions.count*4);
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),y=positions.getY(i),radius=Math.hypot(x,y);
    const across=Math.sin(Math.PI*clamp((radius-inner)/(1-inner)))**2;
    let angle=Math.atan2(y,x);if(angle<0)angle+=Math.PI*2;
    const end=arc<Math.PI*2?Math.sin(Math.PI*clamp(angle/arc))**2:1;
    colors.set([1,1,1,across*end],i*4);
  }
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));
  return geometry;
}

export function createStarSelection(star,{camera,hands,reducedMotion=false,onConfirm,onDepart}){
  const state={active:false,completed:false,departed:false,elapsed:0,progress:0,reach:0,press:0,
    anticipation:0,followThrough:0,lift:0,charge:0,burst:0,light:0,activations:0,surfaces:0,triangles:0};
  const root=new THREE.Group();root.name='NoxSelectionLight';root.visible=false;star.add(root);
  const rings=[],effects=[],arcs=[],geometries=new Set();
  const orientation=new THREE.Quaternion(),cameraOrientation=new THREE.Quaternion();
  const warm=new THREE.Color(0xf5dda8),cool=new THREE.Color(0xb9a5ef);
  let rays=null,motes=null,disposed=false,pendingReducedFrame=false;
  function mesh(geometry,color,type){
    geometries.add(geometry);
    const material=new THREE.MeshBasicMaterial({color,vertexColors:true,transparent:true,
      opacity:0,side:THREE.DoubleSide,depthTest:false,depthWrite:false,
      blending:THREE.AdditiveBlending,toneMapped:false,forceSinglePass:true});
    const object=new THREE.Mesh(geometry,material);object.renderOrder=15;
    object.frustumCulled=false;object.userData.selectionType=type;
    root.add(object);effects.push(object);return object;
  }
  function prepare(){
    if(effects.length)return;
    const ringGeometry=featheredRing(.86,96);
    for(const color of [warm,cool])rings.push(mesh(ringGeometry,color,'wave'));
    if(!reducedMotion){
      const arcGeometry=featheredRing(.91,80,Math.PI*1.65);
      for(const color of [cool,warm])arcs.push(mesh(arcGeometry,color,'ribbon'));
      // Doze raios afilados, com pontas suaves; sem textura de flare.
      const rayPositions=[],rayColors=[];
      for(let i=0;i<12;i++){
        const angle=i*Math.PI/6+.12,length=i%3===0?78:i%2===0?54:35,width=i%3===0?1.9:1.1;
        const c=i%2?cool:warm;
        for(const [r,tangent,alpha] of [[8,0,0],[18,-width,0],[18,0,.85],[18,-width,0],[length,0,0],[18,0,.85],
          [8,0,0],[18,0,.85],[18,width,0],[18,width,0],[18,0,.85],[length,0,0]]){
          rayPositions.push(Math.cos(angle)*r-Math.sin(angle)*tangent,Math.sin(angle)*r+Math.cos(angle)*tangent,0);
          rayColors.push(c.r,c.g,c.b,alpha);
        }
      }
      const rayGeometry=new THREE.BufferGeometry();rayGeometry.setAttribute('position',new THREE.Float32BufferAttribute(rayPositions,3));
      rayGeometry.setAttribute('color',new THREE.Float32BufferAttribute(rayColors,4));rays=mesh(rayGeometry,0xffffff,'corona');
      const moteGeometry=new THREE.BufferGeometry(),positions=new Float32Array(18*12*3),colors=new Float32Array(18*12*4);
      for(let i=0;i<18;i++)for(let v=0;v<12;v++){
        const c=i%2?cool:warm,alpha=v%3===1?.9:0;colors.set([c.r,c.g,c.b,alpha],(i*12+v)*4);
      }
      moteGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
      moteGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));motes=mesh(moteGeometry,0xffffff,'motes');
    }
    state.surfaces=effects.length;
    state.triangles=[...effects].reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0);
  }
  function begin(){
    if(disposed||state.active||state.completed)return false;
    prepare();state.active=true;state.activations++;root.visible=true;
    hands.setStarSelection?.({reach:0,press:0});
    update(0);pendingReducedFrame=reducedMotion;return true;
  }
  function update(delta){
    if(!state.active||disposed)return;
    if(pendingReducedFrame){pendingReducedFrame=false;delta=0;}
    // Compilação/quadros lentos não podem saltar a preparação e o contato.
    state.elapsed+=Math.max(0,reducedMotion?delta:Math.min(delta,.10));
    Object.assign(state,sampleStarSelection(state.elapsed,reducedMotion));
    hands.setStarSelection?.(state);
    star.getWorldQuaternion(orientation);camera.getWorldQuaternion(cameraOrientation);
    root.quaternion.copy(orientation.invert().multiply(cameraOrientation));
    for(let i=0;i<rings.length;i++){
      const delay=i*.28,p=clamp((state.progress-delay)/(1-delay));
      rings[i].scale.setScalar(reducedMotion?20:10+(i===0?68:80)*(1-(1-p)**2));
      rings[i].material.opacity=reducedMotion?(i===0?state.light:0):
        (i===0?.58:.40)*smooth(p,0,.14)*(1-smooth(p,.42,1));
    }
    if(!reducedMotion){
      const p=state.progress,release=smooth(p,.46,1);
      for(let i=0;i<arcs.length;i++){
        const arc=arcs[i],radius=THREE.MathUtils.lerp(38,23,state.charge)+26*release;
        arc.scale.setScalar(radius);arc.rotation.set(i===0?.85:-.95,i===0?.30:-.35,(i===0?1:-1)*(.35+p*1.8));
        arc.material.opacity=(i===0?.52:.42)*state.light;
      }
      rays.rotation.z=-.08+p*.18;rays.scale.setScalar(.65+.55*release);
      rays.material.opacity=.62*state.burst;
      const positions=motes.geometry.attributes.position;
      const gathered=THREE.MathUtils.lerp(64,14,smooth(p,0,.44));
      const ejected=14+98*(1-(1-release)**2);
      const radius=THREE.MathUtils.lerp(gathered,ejected,smooth(p,.44,.54));
      for(let i=0;i<18;i++){
        const angle=i*Math.PI*2/18+.17+p*.85,variation=.82+(i%5)*.09;
        const r=radius*variation,width=.65+(i%3)*.17,length=2.2+5*release;
        const cx=Math.cos(angle)*r,cy=Math.sin(angle)*r;
        for(const [v,[radial,tangent]] of [[-length,0],[0,0],[0,-width],[0,-width],[0,0],[length,0],
          [length,0],[0,0],[0,width],[0,width],[0,0],[-length,0]].entries())
          positions.setXYZ(i*12+v,cx+Math.cos(angle)*radial-Math.sin(angle)*tangent,
            cy+Math.sin(angle)*radial+Math.cos(angle)*tangent,0);
      }
      positions.needsUpdate=true;
      motes.material.opacity=.72*(1-(1-.75*state.charge)*(1-state.burst));
    }
    // A aceleração começa durante o assentamento: luz e gesto terminam
    // no início da viagem, em vez de apagar para depois reiniciar a cena.
    if(!reducedMotion&&onDepart&&!state.departed&&state.progress>=SELECTION_DEPARTURE){
      state.departed=true;onDepart();
    }
    if(state.progress>=1){
      state.active=false;state.completed=true;root.visible=false;
      hands.setStarSelection?.(null);onConfirm?.();
    }
  }
  function dispose(){
    if(disposed)return;disposed=true;state.active=false;root.visible=false;
    hands.setStarSelection?.(null);for(const geometry of geometries)geometry.dispose();
    for(const effect of effects)effect.material.dispose();star.remove(root);
  }
  return {state,root,rings,effects,begin,update,dispose};
}
