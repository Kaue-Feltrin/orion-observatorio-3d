import * as THREE from 'three';
import {createBodyRig,bodyVertex} from './creation-body-rig.js';
import {createCreationSigils,SIGIL_ORBITS} from './creation-sigils.js';
import {sampleCreationRelease} from './creation-fracture.js';

export const CREATION_ART={nebula:'/assets/creation/gray-far-v9.png',nebulaPortrait:'/assets/creation/gray-far-v9.png',baby:'/assets/creation/unborn-v5.png',children:'/assets/creation/souls-v9.png'};
export function creationNebulaURL(aspect=innerWidth/innerHeight){return aspect<.85?CREATION_ART.nebulaPortrait:CREATION_ART.nebula;}
const smooth=(a,b,t)=>THREE.MathUtils.smoothstep(t,a,b);
const fragment=`
 uniform sampler2D uMap;uniform vec4 uUV;uniform float uOpacity,uReveal,uTime,uCharge,uSelected,uFlip,uHover;
 varying vec2 vUv;varying float vEdge,vSeed,vLife;
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(fract(sin(dot(i,vec2(127.1,311.7)))*43758.5453),fract(sin(dot(i+vec2(1.,0.),vec2(127.1,311.7)))*43758.5453),f.x),mix(fract(sin(dot(i+vec2(0.,1.),vec2(127.1,311.7)))*43758.5453),fract(sin(dot(i+1.,vec2(127.1,311.7)))*43758.5453),f.x),f.y);}
 void main(){
  vec2 at=uUV.xy+vec2(mix(vUv.x,1.-vUv.x,uFlip),vUv.y)*uUV.zw;
  vec4 texel=texture2D(uMap,at);
  float n=noise(vUv*10.)*.65+noise(vUv*23.)*.35;
  float mask=smoothstep(n-.13,n+.13,uReveal*1.35-.12);
  // Solid alpha core: only the antialiased contour may blend.
  float coverage=smoothstep(.12,.65,texel.a);
  vec2 stepUV=uUV.zw*.006;
  float nearAlpha=max(max(texture2D(uMap,at+vec2(stepUV.x,0.)).a,texture2D(uMap,at-vec2(stepUV.x,0.)).a),max(texture2D(uMap,at+vec2(0.,stepUV.y)).a,texture2D(uMap,at-vec2(0.,stepUV.y)).a));
  float rim=max(0.,smoothstep(.12,.65,nearAlpha)-coverage);
  float emphasis=.38+uHover*.45+uSelected*.35;
  float alpha=max(coverage,rim*emphasis)*uOpacity*mask*vLife;
  alpha*=smoothstep(0.,.025,vUv.x)*(1.-smoothstep(.975,1.,vUv.x))*smoothstep(0.,.025,vUv.y)*(1.-smoothstep(.975,1.,vUv.y));
  if(alpha<.006)discard;
  vec3 color=mix(vec3(0.),vec3(.8,.53,.20),rim*emphasis)+vec3(.9,.87,.96)*uCharge*.9;
  color*=1.+uCharge*.24;
  gl_FragColor=vec4(color,alpha);
  #include <colorspace_fragment>
 }`;

function material(texture,{opacity=1,uv=[0,0,1,1],motion=1,flip=false}={}){
 return new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,toneMapped:false,
  uniforms:{uMap:{value:texture},uUV:{value:new THREE.Vector4(...uv)},uOpacity:{value:opacity},uMotion:{value:motion},uTime:{value:0},uCharge:{value:0},uReveal:{value:1},uSelected:{value:0},uHover:{value:0},uFlip:{value:flip?1:0}},vertexShader:bodyVertex,fragmentShader:fragment});
}

export {createCreationNebula} from './creation-environment.js';

export function createCreationArt({scene,camera,panel,reducedMotion=false,environment}){
 const loader=new THREE.TextureLoader(),textures={},meshes={},rigs={};
 const root=new THREE.Group();root.name='CreationCinematicLayers';scene.add(root);
 const state={rigMode:'image-skinned-2.5D',joints:48,fieldLayers:0,bindingType:'knowledge-sigils',bindingLayers:SIGIL_ORBITS.length,ready:false,phase:'sealed',releaseProgress:0,selected:null,surfaces:0,fragments:0,particleCount:64,gestureFromMark:false};
 let introStart=null,start=null,resolveRelease=null,aim={x:0,y:0},needsLayout=true,hovered=null;
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
 const atlasUV={baby:[.1494140625,.17578125,.69140625,.6966145833],menina:[.145833333,.072265625,.266927083,.8515625],menino:[.588541667,.072265625,.279947917,.8515625]};
 const bindings=createCreationSigils({reducedMotion});root.add(bindings.root);state.links=0;state.glyphs=bindings.count;
 const ready=Promise.all([bindings.ready,...['baby','children'].map(async name=>{const t=await loader.loadAsync(CREATION_ART[name]);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;textures[name]=t;})]).then(()=>{
  for(const name of ['baby','menina','menino']){
   const m=material(textures[name==='baby'?'baby':'children'],{uv:atlasUV[name],motion:reducedMotion?0:1,flip:false});
   const rig=createBodyRig(m,name==='baby'?'fetal':name);rigs[name]=rig;const mesh=rig.mesh;
   mesh.userData.parallax=.1;mesh.frustumCulled=false;
   // Include the opaque soul in the bloom pass: rear sigils must be occluded there too.
   mesh.layers.enable(1);mesh.renderOrder=11;mesh.visible=name==='baby';root.add(mesh);meshes[name]=mesh;
  }
  return environment?.ready;
 }).then(()=>{introStart=performance.now();state.ready=true;state.surfaces=5;return true;});
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
  for(const [name,selector]of [['baby','.baby-target'],['orbit','.sealed-being'],['menina','[data-gender="menina"] .soul-anchor'],['menino','[data-gender="menino"] .soul-anchor']])rects[name]=panel.querySelector(selector).getBoundingClientRect();
  needsLayout=false;state.layoutPasses=(state.layoutPasses||0)+1;
 }
 function invalidateLayout(){needsLayout=true;}
 const layoutObserver=new ResizeObserver(invalidateLayout);
 for(const element of panel.querySelectorAll('.baby-target,.sealed-being,.soul-anchor,.identity-form,.birth-stage'))layoutObserver.observe(element);
 panel.addEventListener('scroll',invalidateLayout,true);window.addEventListener('resize',invalidateLayout);
 function update(now){
  if(!state.ready)return;
  for(const [name,mesh]of Object.entries(meshes)){const u=mesh.material.uniforms.uHover;u.value=THREE.MathUtils.lerp(u.value,hovered===name?1:0,reducedMotion?1:.15);}
  const time=now*.001;camera.updateWorldMatrix(true,false);camera.getWorldPosition(origin);camera.getWorldQuaternion(q);
  if(needsLayout)layout();
  const intro=reducedMotion?1:smooth(.5,2.1,(now-introStart)/1000);state.introProgress=intro;
  if(state.phase==='sealed')panel.querySelector('.baby-target').disabled=intro<1;
  const elapsed=start===null?0:(now-start)/1000;const release=sampleCreationRelease(elapsed,reducedMotion);
  const active=start!==null;
  const transition=active?(reducedMotion?Math.min(1,elapsed/.18):smooth(.5,1.65,elapsed)):0;
  environment?.setTransition(transition);state.environmentTransition=transition;
  const flash=active&&!reducedMotion?smooth(.12,.52,elapsed)*(1-smooth(.62,1.3,elapsed)):0;
  panel.style.setProperty('--birth-flash',String(flash));panel.style.setProperty('--birth-transition',String(transition));
  if(active)state.releaseProgress=Math.min(1,elapsed/(reducedMotion?.18:2.8));
  const mesh=meshes.baby;
  const float=reducedMotion?0:Math.sin(time*.6)*4;
  place(mesh,rects.baby,-42,atlasUV.baby,time,float);rigs.baby.update(time,reducedMotion,0);
  mesh.material.uniforms.uCharge.value=active?release.charge:0;mesh.material.uniforms.uReveal.value=active?release.baby:1;mesh.material.uniforms.uOpacity.value=intro;
  mesh.visible=!(active&&release.complete);
  const orbit=rects.orbit,size=Math.min(orbit.width,orbit.height),center=rayPoint(orbit.x+orbit.width/2,orbit.y+orbit.height/2+float,-44);
  const left=rayPoint(orbit.x+orbit.width/2-size/2,orbit.y+orbit.height/2,-44),right=rayPoint(orbit.x+orbit.width/2+size/2,orbit.y+orbit.height/2,-44);
  bindings.root.position.copy(center);bindings.root.quaternion.copy(q);bindings.root.scale.setScalar(left.distanceTo(right));
  bindings.update(active?release.fracture:0,active?release.charge:0,intro,time);
  state.bindingFracture=active?release.fracture:0;
  for(const name of ['menina','menino']){
   const mesh=meshes[name];mesh.visible=active;
   if(!active)continue;
   const end=rects[name],begin=rects.baby,t=release.separation,arc=reducedMotion?0:Math.sin(t*Math.PI)*28;
   const rect={width:end.width,height:end.height,x:THREE.MathUtils.lerp(begin.x+begin.width/2-end.width/2,end.x,t),y:THREE.MathUtils.lerp(begin.y+begin.height/2-end.height/2,end.y,t)-arc};
   place(mesh,rect,-39,atlasUV[name],time,reducedMotion?0:Math.sin(time*.55+(name==='menina'?0:2))*4);
   const u=mesh.material.uniforms;rigs[name].update(time,reducedMotion,u.uSelected.value);u.uReveal.value=release.children;u.uSelected.value=THREE.MathUtils.lerp(u.uSelected.value,state.selected===name?1:0,reducedMotion?1:.12);
  }
  if(active&&!reducedMotion){particles.visible=true;const center=bindings.root.position;particles.position.copy(center);particles.quaternion.copy(q);pm.uniforms.uTime.value=time;pm.uniforms.uElapsed.value=elapsed;pm.uniforms.uActive.value=release.particles;pm.uniforms.uExtent.value.set(bindings.root.scale.x,bindings.root.scale.y);}
  if(active&&release.complete&&resolveRelease){state.phase='identity';const done=resolveRelease;resolveRelease=null;done();}
 }
 function release(){if(start!==null)return Promise.resolve(false);state.phase='breaking';start=performance.now();return new Promise(resolve=>{resolveRelease=resolve});}
 return {ready,state,update,release,invalidateLayout,get meshes(){return meshes},rigs,bindings,hover(value){hovered=value},select(value){state.selected=value},point(value){aim=value},dispose(){layoutObserver.disconnect();panel.removeEventListener('scroll',invalidateLayout,true);window.removeEventListener('resize',invalidateLayout);scene.remove(root);bindings.dispose();for(const r of Object.values(rigs))r.dispose();pg.dispose();pm.dispose();for(const m of Object.values(meshes))m.material.dispose();for(const t of Object.values(textures))t.dispose();}};
}
