import * as THREE from 'three';
import {createFractureGeometry,sampleCreationRelease} from './creation-fracture.js';

export const CREATION_ART={nebula:'/assets/creation/nebula-interior.png',baby:'/assets/creation/unborn-soul.png',children:'/assets/creation/child-spirits-atlas.png',chains:'/assets/creation/seal-chains.png',field:'/assets/creation/forcefield.png'};
const smooth=(a,b,t)=>THREE.MathUtils.smoothstep(t,a,b);
const vertex=`
 attribute vec2 aCenter;attribute float aSeed,aEdge;
 uniform float uBreak,uTime,uCharge,uMotion;
 varying vec2 vUv;varying float vEdge,vSeed,vLife;
 void main(){
  vUv=uv;vEdge=aEdge;vSeed=aSeed;
  float delay=length(aCenter)*.18+aSeed*.08;
  float release=smoothstep(.12+delay,.74+delay,uBreak)*uMotion;
  float angle=release*(aSeed-.5)*4.2;
  vec2 local=position.xy-aCenter;
  mat2 rotation=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
  vec3 p=position;
  vec2 spun=rotation*local;float tilt=release*(aSeed-.5)*3.8;
  p.xy=aCenter+vec2(spun.x*cos(tilt),spun.y);
  vec2 dir=normalize(aCenter+vec2(.017,.009));
  float distance=release*release*(.48+aSeed*.75);
  p.xy+=dir*distance;
  p.y-=release*release*.16*(.5+aSeed);
  p.z+=spun.x*sin(tilt)+release*(aSeed-.5)*.35;
  p.xy*=1.+uCharge*.012;
  vLife=1.-smoothstep(.6,1.,uBreak);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
 }`;
const fragment=`
 uniform sampler2D uMap;uniform vec4 uUV;uniform float uOpacity,uBreak,uReveal,uTime,uCharge,uSelected;
 uniform vec3 uTint;uniform float uIsSeal;
 varying vec2 vUv;varying float vEdge,vSeed,vLife;
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(fract(sin(dot(i,vec2(127.1,311.7)))*43758.5453),fract(sin(dot(i+vec2(1.,0.),vec2(127.1,311.7)))*43758.5453),f.x),mix(fract(sin(dot(i+vec2(0.,1.),vec2(127.1,311.7)))*43758.5453),fract(sin(dot(i+1.,vec2(127.1,311.7)))*43758.5453),f.x),f.y);}
 void main(){
  vec2 at=uUV.xy+vUv*uUV.zw;
  vec4 texel=texture2D(uMap,at);
  float n=noise(vUv*10.)*.65+noise(vUv*23.)*.35;
  float mask=smoothstep(n-.13,n+.13,uReveal*1.35-.12);
  float edge=1.-smoothstep(.001,.0045,vEdge);
  float cracks=edge*smoothstep(.015,.16,uBreak)*(1.-smoothstep(.45,.85,uBreak))*uIsSeal;
  float frontier=(1.-smoothstep(.02,.1,abs(n-(uReveal*1.35-.12))))*step(.01,uReveal)*(1.-step(.99,uReveal));
  float alpha=texel.a*uOpacity*mask*vLife;
  if(alpha<.006)discard;
  vec3 color=texel.rgb*uTint;
  color+=vec3(1.,.71,.28)*cracks*1.15;
  color+=vec3(.32,.24,.6)*(frontier*.7+uSelected*.2);
  color*=1.+uCharge*.24;
  gl_FragColor=vec4(color,alpha);
  #include <colorspace_fragment>
 }`;

function material(texture,{opacity=1,uv=[0,0,1,1],seal=false,motion=1}={}){
 return new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,toneMapped:false,
  uniforms:{uMap:{value:texture},uUV:{value:new THREE.Vector4(...uv)},uOpacity:{value:opacity},uBreak:{value:0},uMotion:{value:motion},uTime:{value:0},uCharge:{value:0},uReveal:{value:1},uTint:{value:new THREE.Color('white')},uSelected:{value:0},uIsSeal:{value:seal?1:0}},vertexShader:vertex,fragmentShader:fragment});
}

// Same camera and per-frame API as the original nebula volume. One sky image
// is sampled at different UV regions; no duplicated image downloads/textures.
export function createCreationNebula(scene,photo,{reducedMotion=false,parallaxEnabled=true,foregroundEnabled=true}={}){
 const specs=[{uv:[0,.08,.28,.68],x:.14,y:.46,z:-340,alpha:.22,pan:2},
  {uv:[.72,.07,.28,.7],x:.86,y:.43,z:-235,alpha:.2,pan:4},
  {uv:[.02,0,.37,.27],x:.18,y:.87,z:-125,alpha:.14,pan:5.5},
  {uv:[.65,.65,.34,.33],x:.86,y:.15,z:-65,alpha:.12,pan:7}];
 const state={active:0,loaded:4,parallaxEnabled:parallaxEnabled&&!reducedMotion,parallaxStrength:1,foregroundEnabled};
 const layers=specs.map((s,i)=>{
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,toneMapped:false,
   uniforms:{map:{value:photo.material.map},rect:{value:new THREE.Vector4(...s.uv)},opacity:{value:s.alpha}},
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:`uniform sampler2D map;uniform vec4 rect;uniform float opacity;varying vec2 vUv;void main(){vec4 c=texture2D(map,rect.xy+vUv*rect.zw);float r=length((vUv-.5)*vec2(2.,2.));float feather=1.-smoothstep(.45,1.,r);float light=dot(c.rgb,vec3(.21,.72,.07));gl_FragColor=vec4(c.rgb,feather*opacity*smoothstep(.015,.2,light));#include <colorspace_fragment>}`.replace(';#include',';\n#include')});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),m);mesh.renderOrder=2.2+i*.1;mesh.position.z=s.z;
  mesh.userData={spec:s,volumeFragment:true,layerName:'Interior da nebulosa '+(i+1),baseX:0,baseY:0,parallaxOffsetX:0,parallaxOffsetY:0};scene.add(mesh);return mesh;
 });
 function applyQuality(q){const count=['eco','lite'].includes(q)?2:4;layers.forEach((m,i)=>m.visible=i<count);state.active=count;}
 function resize(){for(const m of layers){const s=m.userData.spec,ratio=(26-m.position.z)/(26-photo.position.z);m.scale.set(photo.scale.x*s.uv[2]*ratio*1.2,photo.scale.y*s.uv[3]*ratio*1.2,1);m.userData.baseX=(s.x-.5)*photo.scale.x*ratio;m.userData.baseY=(.5-s.y)*photo.scale.y*ratio;}}
 function update(time,x,y,delta){const gain=1-Math.exp(-Math.max(0,Math.min(.1,delta))*5);for(const m of layers){const d=m.userData,s=d.spec;const px=state.parallaxEnabled?-x*s.pan*state.parallaxStrength:0,py=state.parallaxEnabled?-y*s.pan*.35:0;d.parallaxOffsetX+=(px-d.parallaxOffsetX)*gain;d.parallaxOffsetY+=(py-d.parallaxOffsetY)*gain;m.position.x=d.baseX+d.parallaxOffsetX+(reducedMotion?0:Math.sin(time*.1+s.z)*.3);m.position.y=d.baseY+d.parallaxOffsetY;}}
 return {layers,state,resize,update,applyQuality,setParallaxStrength(v){state.parallaxStrength=THREE.MathUtils.clamp(v,.45,1.6)}};
}

export function createCreationArt({scene,camera,panel,reducedMotion=false}){
 const loader=new THREE.TextureLoader(),textures={},meshes={},geometry=createFractureGeometry(6,6);
 const root=new THREE.Group();root.name='CreationCinematicLayers';scene.add(root);
 const state={ready:false,phase:'sealed',releaseProgress:0,selected:null,surfaces:0,fragments:36,particleCount:64,gestureFromMark:false};
 let start=null,resolveRelease=null,aim={x:0,y:0},lastLayout=0;
 const rects={};const origin=new THREE.Vector3(),ray=new THREE.Vector3(),q=new THREE.Quaternion();
 function rayPoint(x,y,z){ray.set(x/innerWidth*2-1,1-y/innerHeight*2,.5).unproject(camera).sub(origin).normalize();return origin.clone().addScaledVector(ray,(z-origin.z)/ray.z);}
 function place(mesh,rect,z,uv,time=0,breath=0){
  const image=mesh.material.uniforms.uMap.value.image;if(!image||!rect.width||!rect.height)return;
  const aspect=image.width*uv[2]/(image.height*uv[3]);const h=Math.min(rect.height,rect.width/aspect),w=h*aspect;
  const pos=rayPoint(rect.x+rect.width/2,rect.y+rect.height/2+breath,z);
  const left=rayPoint(rect.x+rect.width/2-w/2,rect.y+rect.height/2,z),right=rayPoint(rect.x+rect.width/2+w/2,rect.y+rect.height/2,z);
  if(!reducedMotion){pos.x+=aim.x*(mesh.userData.parallax??.12);pos.y+=aim.y*.07;}
  mesh.position.copy(pos);mesh.scale.set(left.distanceTo(right),left.distanceTo(right)/aspect,left.distanceTo(right));mesh.quaternion.copy(q);
  mesh.material.uniforms.uTime.value=time;
 }
 const atlasUV={baby:[.25,.06,.52,.88],field:[0,0,1,1],chains:[0,0,1,1],menina:[0,0,.52,1],menino:[.52,0,.48,1]};
 const ready=Promise.all(['baby','field','chains','children'].map(async name=>{const t=await loader.loadAsync(CREATION_ART[name]);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;textures[name]=t;})).then(()=>{
  for(const [name,order,opacity]of [['baby',11,.78],['field',12,.4],['chains',13,.85],['menina',11,.8],['menino',11,.8]]){
   const mesh=new THREE.Mesh(geometry,material(textures[name==='menina'||name==='menino'?'children':name],{uv:atlasUV[name],opacity,motion:reducedMotion?0:1,seal:name==='field'||name==='chains'}));
   if(name==='field')mesh.layers.enable(1);
   mesh.userData.parallax=name==='chains'?.25:name==='field'?.17:.1;mesh.frustumCulled=false;mesh.renderOrder=order;mesh.visible=name!=='menina'&&name!=='menino';root.add(mesh);meshes[name]=mesh;
  }
  state.ready=true;state.surfaces=5;return true;
 });
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
  for(const [name,selector]of [['baby','.baby-target'],['field','.sealed-being'],['chains','.sealed-being'],['menina','[data-gender="menina"]'],['menino','[data-gender="menino"]']])rects[name]=panel.querySelector(selector).getBoundingClientRect();
 }
 function update(now){
  if(!state.ready)return;
  const time=now*.001;camera.updateWorldMatrix(true,false);camera.getWorldPosition(origin);camera.getWorldQuaternion(q);
  if(now-lastLayout>80){layout();lastLayout=now;}
  const elapsed=start===null?0:(now-start)/1000;const release=sampleCreationRelease(elapsed,reducedMotion);
  const active=start!==null;
  if(active)state.releaseProgress=Math.min(1,elapsed/(reducedMotion?.18:2.8));
  for(const name of ['baby','field','chains']){
   const mesh=meshes[name],rect=rects[name];
   const float=reducedMotion?0:Math.sin(time*.6)*4;
   place(mesh,rect,-42,atlasUV[name],time,float);
   const u=mesh.material.uniforms;
   u.uCharge.value=active?release.charge:0;u.uBreak.value=active&&name!=='baby'?release.fracture:0;
   u.uReveal.value=name==='baby'&&active?release.baby:1;
   mesh.visible=!(active&&release.complete);
  }
  for(const name of ['menina','menino']){
   const mesh=meshes[name];mesh.visible=active;
   if(!active)continue;
   const end=rects[name],begin=rects.baby,t=release.separation,arc=reducedMotion?0:Math.sin(t*Math.PI)*28;
   const rect={width:end.width,height:end.height,x:THREE.MathUtils.lerp(begin.x+begin.width/2-end.width/2,end.x,t),y:THREE.MathUtils.lerp(begin.y+begin.height/2-end.height/2,end.y,t)-arc};
   place(mesh,rect,-39,atlasUV[name],time,reducedMotion?0:Math.sin(time*.55+(name==='menina'?0:2))*4);
   const u=mesh.material.uniforms;u.uReveal.value=release.children;u.uSelected.value=state.selected===name?1:0;
  }
  if(active&&!reducedMotion){particles.visible=true;const center=meshes.field.position;particles.position.copy(center);particles.quaternion.copy(q);pm.uniforms.uTime.value=time;pm.uniforms.uElapsed.value=elapsed;pm.uniforms.uActive.value=release.particles;pm.uniforms.uExtent.value.set(meshes.field.scale.x,meshes.field.scale.y);}
  if(active&&release.complete&&resolveRelease){state.phase='identity';const done=resolveRelease;resolveRelease=null;done();}
 }
 function release(){if(start!==null)return Promise.resolve(false);state.phase='breaking';start=performance.now();return new Promise(resolve=>{resolveRelease=resolve});}
 return {ready,state,update,release,get meshes(){return meshes},select(value){state.selected=value},point(value){aim=value},dispose(){scene.remove(root);geometry.dispose();pg.dispose();pm.dispose();for(const m of Object.values(meshes))m.material.dispose();for(const t of Object.values(textures))t.dispose();}};
}
