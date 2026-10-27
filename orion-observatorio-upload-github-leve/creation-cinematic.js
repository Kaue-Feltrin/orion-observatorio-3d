import * as THREE from 'three';
import {createBodyRig,bodyVertex} from './creation-body-rig.js';
import {createCreationBindings} from './creation-bindings.js';
import {sampleCreationRelease} from './creation-fracture.js';

export const CREATION_ART={nebula:'/assets/creation/atmosphere-base.svg',baby:'/assets/creation/unborn-v5.png',children:'/assets/creation/souls-v5.png',mist:'/assets/creation/mist-v5.png'};
const smooth=(a,b,t)=>THREE.MathUtils.smoothstep(t,a,b);
const vertex=`
 uniform float uTime,uMotion;varying vec2 vUv;varying float vEdge,vSeed,vLife;
 void main(){vUv=uv;vEdge=1.;vSeed=0.;vLife=1.;vec3 p=position;
 p.xy*=1.+sin(uTime*.45)*.003*uMotion;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
const fragment=`
 uniform sampler2D uMap;uniform vec4 uUV;uniform float uOpacity,uBreak,uReveal,uTime,uCharge,uSelected,uFog,uSilhouette,uFogFront,uFlip;
 uniform vec3 uTint;uniform float uIsSeal;
 varying vec2 vUv;varying float vEdge,vSeed,vLife;
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(fract(sin(dot(i,vec2(127.1,311.7)))*43758.5453),fract(sin(dot(i+vec2(1.,0.),vec2(127.1,311.7)))*43758.5453),f.x),mix(fract(sin(dot(i+vec2(0.,1.),vec2(127.1,311.7)))*43758.5453),fract(sin(dot(i+1.,vec2(127.1,311.7)))*43758.5453),f.x),f.y);}
 void main(){
  vec2 at=uUV.xy+vec2(mix(vUv.x,1.-vUv.x,uFlip),vUv.y)*uUV.zw;
  vec4 texel=texture2D(uMap,at);
  float n=noise(vUv*10.)*.65+noise(vUv*23.)*.35;
  float mask=smoothstep(n-.13,n+.13,uReveal*1.35-.12);
  float edge=1.-smoothstep(.001,.0045,vEdge);
  float cracks=edge*smoothstep(.015,.16,uBreak)*(1.-smoothstep(.45,.85,uBreak))*uIsSeal;
  float frontier=(1.-smoothstep(.02,.1,abs(n-(uReveal*1.35-.12))))*step(.01,uReveal)*(1.-step(.99,uReveal));
  float radius=length((vUv-.5)*2.);
  if(uFog>.5){
   float a=uTime*.017*(uFogFront>.5?-1.:1.);
   mat2 turn=mat2(cos(a),-sin(a),sin(a),cos(a));
   vec2 flow=turn*(vUv-.5)+.5;
   flow+=vec2(noise(vUv*4.+uTime*.014)-.5,noise(vUv*4.+5.-uTime*.011)-.5)*.017;
   vec4 mist=texture2D(uMap,clamp(flow,vec2(.001),vec2(.999)));
   float feather=1.-smoothstep(.75,1.,radius);
   float wispMask=mix(1.,smoothstep(.38,.72,noise(vUv*4.-uTime*.018)),uFogFront);
   texel=vec4(mist.rgb*.16+.025,(mist.a*.55+exp(-radius*radius*3.5)*.13)*feather*wispMask);
  }
  float alpha=texel.a*uOpacity*mask*vLife;
  alpha*=smoothstep(0.,.025,vUv.x)*(1.-smoothstep(.975,1.,vUv.x))*smoothstep(0.,.025,vUv.y)*(1.-smoothstep(.975,1.,vUv.y));
  if(alpha<.006)discard;
  vec3 color=texel.rgb*uTint;
  color+=vec3(1.,.71,.28)*cracks*1.15;
  color+=vec3(.32,.24,.6)*frontier*.7*(1.-uSilhouette);
  if(uSilhouette>.5){color=max(vec3(.0001,.00008,.00015),texel.rgb*.20)+vec3(.9,.87,.96)*uCharge*.9;

  }
  color*=1.+uCharge*.24;
  gl_FragColor=vec4(color,alpha);
  #include <colorspace_fragment>
 }`;

function material(texture,{opacity=1,uv=[0,0,1,1],seal=false,motion=1,fog=false,silhouette=false,flip=false}={}){
 return new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,toneMapped:false,
  uniforms:{uMap:{value:texture},uUV:{value:new THREE.Vector4(...uv)},uOpacity:{value:opacity},uBreak:{value:0},uMotion:{value:motion},uTime:{value:0},uCharge:{value:0},uReveal:{value:1},uTint:{value:new THREE.Color('white')},uSelected:{value:0},uIsSeal:{value:seal?1:0},uFog:{value:fog?1:0},uSilhouette:{value:silhouette?1:0},uFogFront:{value:0},uFlip:{value:flip?1:0}},vertexShader:vertex,fragmentShader:fragment});
}

// Low-frequency pigment atmosphere, no photographs or anatomical imagery.
export function createCreationNebula(scene,photo,{reducedMotion=false,parallaxEnabled=true}={}){
 const clock={value:0},transition={value:0},pan={value:new THREE.Vector2()},aspect={value:innerWidth/innerHeight};
 const noiseCode=`float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}float fbm(vec2 p){return noise(p)*.65+noise(p*2.03+7.)*.25+noise(p*4.01+17.)*.1;}`;
 const fragmentShader=`uniform float time,transition,aspect,opacity;uniform vec2 pan;varying vec2 vUv;${noiseCode}
 void main(){vec2 p=(vUv-.5)*vec2(aspect,1.)+pan;float drift=time*.009;
 vec2 warp=vec2(fbm(p*1.7+drift),fbm(p*1.5+8.-drift))-.5;
 float n=fbm(p*2.2+warp*.8+vec2(drift,-drift*.7));float m=fbm(p*1.4+warp+vec2(4.,drift));
 float pulse=${reducedMotion?'0.':'sin(time*.8)*.015'};
 float center=exp(-dot(p*vec2(1.1,1.25),p*vec2(1.1,1.25))*3.);
 vec3 wine=mix(vec3(.003,.0015,.003),vec3(.037,.007,.014),smoothstep(.15,.9,n))*(1.+pulse)+vec3(.006,.003,.004)*center;
 float pools=exp(-dot((p-vec2(aspect*.19,.02))*vec2(2.6,1.5),(p-vec2(aspect*.19,.02))*vec2(2.6,1.5))*3.)+exp(-dot((p+vec2(aspect*.19,-.02))*vec2(2.6,1.5),(p+vec2(aspect*.19,-.02))*vec2(2.6,1.5))*3.);
 vec3 ash=vec3(.004,.0038,.006)+vec3(.011,.010,.015)*(n*.65+m*.35)+vec3(.009,.008,.011)*pools;
 float star=pow(max(0.,hash(floor((p+4.)*65.))-.998)/.002,3.)*(1.-smoothstep(.03,.12,length(fract((p+4.)*65.)-.5)))*.025;
 vec3 c=mix(wine,ash+star,transition);
 gl_FragColor=vec4(c,opacity);
 #include <colorspace_fragment>
 }`;
 const uniforms={time:clock,transition,pan,aspect,opacity:{value:1}};
 const original=photo.material,map=original.map;
 photo.material=new THREE.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,toneMapped:false,
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy*2.,.999,1.);}',fragmentShader});
 photo.material.map=map;original.dispose();
 const state={active:0,loaded:2,transition:0,parallaxEnabled:parallaxEnabled&&!reducedMotion,parallaxStrength:1,foregroundEnabled:true};
 const layers=[-230,-90].map((z,i)=>{
  const m=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,
   uniforms:{...uniforms,map:{value:map},opacity:{value:i===0?.035:.025}},
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),m);mesh.position.z=z;mesh.renderOrder=3+i*.1;mesh.userData={volumeFragment:true,baseX:0,baseY:0,parallaxOffsetX:0,parallaxOffsetY:0};scene.add(mesh);return mesh;
 });
 function resize(){for(const mesh of layers){const d=26-mesh.position.z,h=2*Math.tan(26*Math.PI/180)*d*1.5;mesh.scale.set(h*innerWidth/innerHeight,h,1);}}
 function update(time,x,y,delta){clock.value=reducedMotion?0:time;aspect.value=innerWidth/innerHeight;
  const gain=1-Math.exp(-Math.min(.1,Math.max(0,delta))*5);
  pan.value.x+=((state.parallaxEnabled?-x*.014:0)-pan.value.x)*gain;pan.value.y+=((state.parallaxEnabled?-y*.01:0)-pan.value.y)*gain;
  layers.forEach((mesh,i)=>{const d=mesh.userData;d.parallaxOffsetX+=((state.parallaxEnabled?-x*(2+i*2)*state.parallaxStrength:0)-d.parallaxOffsetX)*gain;d.parallaxOffsetY+=((state.parallaxEnabled?-y*(1+i):0)-d.parallaxOffsetY)*gain;mesh.position.x=d.parallaxOffsetX;mesh.position.y=d.parallaxOffsetY;});
 }
 return {ready:Promise.resolve(true),layers,state,resize,update,applyQuality(q){state.active=['eco','lite'].includes(q)?1:2;layers.forEach((l,i)=>l.visible=i<state.active)},setTransition(v){transition.value=v;state.transition=v;},setParallaxStrength(v){state.parallaxStrength=THREE.MathUtils.clamp(v,.45,1.6)}};
}

export function createCreationArt({scene,camera,panel,reducedMotion=false,environment}){
 const loader=new THREE.TextureLoader(),textures={},meshes={},rigs={},geometry=new THREE.PlaneGeometry(1,1,12,12);
 const root=new THREE.Group();root.name='CreationCinematicLayers';scene.add(root);
 const state={rigMode:'image-skinned-2.5D',joints:48,fieldLayers:2,bindingLayers:2,ready:false,phase:'sealed',releaseProgress:0,selected:null,surfaces:0,fragments:0,particleCount:64,gestureFromMark:false};
 let introStart=null,start=null,resolveRelease=null,aim={x:0,y:0},lastLayout=0;
 const rects={};const origin=new THREE.Vector3(),ray=new THREE.Vector3(),q=new THREE.Quaternion();
 function rayPoint(x,y,z){ray.set(x/innerWidth*2-1,1-y/innerHeight*2,.5).unproject(camera).sub(origin).normalize();return origin.clone().addScaledVector(ray,(z-origin.z)/ray.z);}
 function place(mesh,rect,z,uv,time=0,breath=0){
  const image=mesh.material.uniforms.uMap.value.image;if(!image||!rect.width||!rect.height)return;
  const aspect=image.width*uv[2]/(image.height*uv[3]);const h=Math.min(rect.height,rect.width/aspect),w=h*aspect;
  const pos=rayPoint(rect.x+rect.width/2,rect.y+rect.height/2+breath,z);
  const left=rayPoint(rect.x+rect.width/2-w/2,rect.y+rect.height/2,z),right=rayPoint(rect.x+rect.width/2+w/2,rect.y+rect.height/2,z);
  if(!reducedMotion){pos.x+=aim.x*(mesh.userData.parallax??.12);pos.y+=aim.y*.07;}
  mesh.position.copy(pos);mesh.scale.set(left.distanceTo(right),left.distanceTo(right)/aspect,left.distanceTo(right));mesh.quaternion.copy(q);
  mesh.material.uniforms.uTime.value=reducedMotion?0:time;
 }
 const atlasUV={baby:[.1494140625,.17578125,.69140625,.6966145833],field:[0,0,1,1],fieldFront:[0,0,1,1],menina:[.678692221,.0259301015,.1674182638,.9560315671],menino:[.1657271702,.0304396843,.1809470124,.9695603157]};
 const bindings=createCreationBindings();root.add(bindings.root);state.links=bindings.count;
 const ready=Promise.all(['baby','children','mist'].map(async name=>{const t=await loader.loadAsync(CREATION_ART[name]);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;textures[name]=t;})).then(()=>{
  for(const [name,order,opacity] of [['field',9,.75],['baby',11,1],['fieldFront',12,.32],['menina',11,1],['menino',11,1]]){
   const silhouette=['baby','menina','menino'].includes(name);
   const m=material(textures[silhouette?(name==='baby'?'baby':'children'):'mist'],{uv:atlasUV[name],opacity,motion:reducedMotion?0:1,fog:!silhouette,silhouette,flip:name==='menina'||name==='menino'});
   let mesh;
   if(silhouette){m.vertexShader=bodyVertex;const rig=createBodyRig(m,name==='baby'?'fetal':name);rigs[name]=rig;mesh=rig.mesh;}
   else mesh=new THREE.Mesh(geometry,m);
   if(name==='fieldFront')m.uniforms.uFogFront.value=1;
   mesh.userData.parallax=.1;mesh.frustumCulled=false;mesh.renderOrder=order;mesh.visible=name!=='menina'&&name!=='menino';root.add(mesh);meshes[name]=mesh;
  }
  return environment?.ready;
 }).then(()=>{introStart=performance.now();state.ready=true;state.surfaces=8;return true;});
 // One particle batch, generated once, animated analytically in the shader.
 const count=64,positions=new Float32Array(count*3),velocities=new Float32Array(count*3),seeds=new Float32Array(count);
 for(let i=0;i<count;i++){const angle=i*2.3999632,r=.28+(i%7)/35;positions[i*3]=Math.cos(angle)*r;positions[i*3+1]=Math.sin(angle)*r;velocities[i*3]=Math.cos(angle)*(1.1+(i%5)*.2);velocities[i*3+1]=Math.sin(angle)*.9;velocities[i*3+2]=(i%3-1)*.3;seeds[i]=(i*.6180339)%1;}
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(positions,3));pg.setAttribute('aVelocity',new THREE.BufferAttribute(velocities,3));pg.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
 const pm=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,
  uniforms:{uTime:{value:0},uElapsed:{value:0},uActive:{value:0},uExtent:{value:new THREE.Vector2(1,1)},uDpr:{value:Math.min(devicePixelRatio,1.5)}},
  vertexShader:`attribute vec3 aVelocity;attribute float aSeed;uniform float uTime,uElapsed,uActive,uDpr;uniform vec2 uExtent;varying float alpha;void main(){float t=max(0.,uElapsed-.6);float flight=min(t,4.);float drag=1.-exp(-flight*.9);vec3 p=position+aVelocity*drag;p.y-=.025*flight*flight;p.xy+=vec2(sin(uTime*.2+aSeed*10.),cos(uTime*.17+aSeed*8.))*.012*step(4.,t);vec4 mv=modelViewMatrix*vec4(p.xy*uExtent,p.z,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(1.5+aSeed*2.8)*uDpr;alpha=uActive*smoothstep(0.,.2,t)*(.38+.22*sin(uTime*.7+aSeed*10.))*mix(1.,step(.75,aSeed)*.22,smoothstep(4.,8.,t));}`,
  fragmentShader:'varying float alpha;void main(){float r=length(gl_PointCoord-.5);float a=(1.-smoothstep(.02,.5,r))*alpha;gl_FragColor=vec4(1.,.84,.5,a);}' });
 const particles=new THREE.Points(pg,pm);particles.layers.enable(1);particles.renderOrder=15;particles.frustumCulled=false;particles.visible=!reducedMotion;root.add(particles);
 function layout(){
  // Hit areas stay stationary and accessible. Only painted planes move subtly.
  for(const [name,selector]of [['baby','.baby-target'],['field','.sealed-being'],['fieldFront','.sealed-being'],['menina','[data-gender="menina"]'],['menino','[data-gender="menino"]']])rects[name]=panel.querySelector(selector).getBoundingClientRect();
 }
 function update(now){
  if(!state.ready)return;
  const time=now*.001;camera.updateWorldMatrix(true,false);camera.getWorldPosition(origin);camera.getWorldQuaternion(q);
  if(now-lastLayout>80){layout();lastLayout=now;}
  const intro=reducedMotion?1:smooth(.5,2.1,(now-introStart)/1000);state.introProgress=intro;
  if(state.phase==='sealed')panel.querySelector('.baby-target').disabled=intro<1;
  const elapsed=start===null?0:(now-start)/1000;const release=sampleCreationRelease(elapsed,reducedMotion);
  const active=start!==null;
  const transition=active?(reducedMotion?Math.min(1,elapsed/.18):smooth(.5,1.65,elapsed)):0;
  environment?.setTransition(transition);state.environmentTransition=transition;
  const flash=active&&!reducedMotion?smooth(.12,.52,elapsed)*(1-smooth(.62,1.3,elapsed)):0;
  panel.style.setProperty('--birth-flash',String(flash));panel.style.setProperty('--birth-transition',String(transition));
  if(active)state.releaseProgress=Math.min(1,elapsed/(reducedMotion?.18:2.8));
  for(const name of ['baby','field','fieldFront']){
   const mesh=meshes[name],rect=rects[name];
   const float=reducedMotion?0:Math.sin(time*.6)*4;
   place(mesh,rect,name==='field'?-44:name==='fieldFront'?-40:-42,atlasUV[name],time+(name==='fieldFront'?4.7:0),float);
   if(rigs[name])rigs[name].update(time,reducedMotion,0);
   const u=mesh.material.uniforms;
   u.uCharge.value=active?release.charge:0;u.uBreak.value=0;u.uOpacity.value=name==='field'?.75*(active?1-smooth(.35,1.5,elapsed):1):name==='fieldFront'?.32*(active?1-smooth(.3,1.3,elapsed):1):1;
   u.uReveal.value=name==='baby'&&active?release.baby:1;u.uOpacity.value*=intro;
   mesh.visible=!(active&&release.complete);
  }
  bindings.root.position.copy(meshes.field.position);bindings.root.quaternion.copy(q);bindings.root.scale.copy(meshes.field.scale);bindings.update(reducedMotion?0:active?release.fracture:0,active?release.charge:0,intro*(reducedMotion&&active?1-release.fracture:1));
  state.bindingFracture=active?release.fracture:0;
  for(const name of ['menina','menino']){
   const mesh=meshes[name];mesh.visible=active;
   if(!active)continue;
   const end=rects[name],begin=rects.baby,t=release.separation,arc=reducedMotion?0:Math.sin(t*Math.PI)*28;
   const rect={width:end.width,height:end.height,x:THREE.MathUtils.lerp(begin.x+begin.width/2-end.width/2,end.x,t),y:THREE.MathUtils.lerp(begin.y+begin.height/2-end.height/2,end.y,t)-arc};
   place(mesh,rect,-39,atlasUV[name],time,reducedMotion?0:Math.sin(time*.55+(name==='menina'?0:2))*4);
   const u=mesh.material.uniforms;rigs[name].update(time,reducedMotion,u.uSelected.value);u.uReveal.value=release.children;u.uSelected.value=THREE.MathUtils.lerp(u.uSelected.value,state.selected===name?1:0,reducedMotion?1:.12);
  }
  if(active&&!reducedMotion){particles.visible=true;const center=meshes.field.position;particles.position.copy(center);particles.quaternion.copy(q);pm.uniforms.uTime.value=time;pm.uniforms.uElapsed.value=elapsed;pm.uniforms.uActive.value=release.particles;pm.uniforms.uExtent.value.set(meshes.field.scale.x,meshes.field.scale.y);}
  if(active&&release.complete&&resolveRelease){state.phase='identity';const done=resolveRelease;resolveRelease=null;done();}
 }
 function release(){if(start!==null)return Promise.resolve(false);state.phase='breaking';start=performance.now();return new Promise(resolve=>{resolveRelease=resolve});}
 return {ready,state,update,release,get meshes(){return meshes},rigs,bindings,select(value){state.selected=value},point(value){aim=value},dispose(){scene.remove(root);geometry.dispose();bindings.dispose();for(const r of Object.values(rigs))r.dispose();pg.dispose();pm.dispose();for(const m of Object.values(meshes))m.material.dispose();for(const t of Object.values(textures))t.dispose();}};
}
