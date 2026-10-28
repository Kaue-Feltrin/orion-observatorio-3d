import * as THREE from 'three';
import {createBodyRig,bodyVertex} from './creation-body-rig.js';
import {createCreationSigils,SIGIL_ORBITS} from './creation-sigils.js';
import {sampleCreationRelease} from './creation-fracture.js';

export const CREATION_ART={nebula:'/assets/creation/ink-cosmos-v7.png',nebulaPortrait:'/assets/creation/ink-cosmos-portrait-v7.png',baby:'/assets/creation/unborn-v5.png',children:'/assets/creation/souls-v7.png'};
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
  float emphasis=.24+uHover*.55+uSelected*.5;
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

// Layered ink painting plus slow procedural drift; separate from the original sky.
export function createCreationNebula(scene,photo,{reducedMotion=false,parallaxEnabled=true}={}){
 const clock={value:0},transition={value:0},pan={value:new THREE.Vector2()},aspect={value:innerWidth/innerHeight},plateAspect={value:innerWidth/innerHeight<.85?2/3:1672/941};
 const noiseCode=`float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}float fbm(vec2 p){return noise(p)*.65+noise(p*2.03+7.)*.25+noise(p*4.01+17.)*.1;}`;
 const fragmentShader=`uniform sampler2D plate;uniform float time,transition,aspect,plateAspect,opacity,layer;uniform vec2 pan;varying vec2 vUv;${noiseCode}
 void main(){vec2 p=(vUv-.5)*vec2(aspect,1.)+pan;float drift=time*.009;
 vec2 warp=vec2(fbm(p*1.7+drift),fbm(p*1.5+8.-drift))-.5;
 float n=fbm(p*2.2+warp*.8+vec2(drift,-drift*.7));float m=fbm(p*1.4+warp+vec2(4.,drift));
 float pulse=${reducedMotion?'0.':'sin(time*.8)*.015'};
 float center=exp(-dot(p*vec2(1.1,1.25),p*vec2(1.1,1.25))*3.);
 vec3 wine=mix(vec3(.003,.0015,.003),vec3(.037,.007,.014),smoothstep(.15,.9,n))*(1.+pulse)+vec3(.006,.003,.004)*center;
 float pools=exp(-dot((p-vec2(aspect*.19,.02))*vec2(2.6,1.5),(p-vec2(aspect*.19,.02))*vec2(2.6,1.5))*3.)+exp(-dot((p+vec2(aspect*.19,-.02))*vec2(2.6,1.5),(p+vec2(aspect*.19,-.02))*vec2(2.6,1.5))*3.);
 vec3 ash=vec3(.004,.0038,.006)+vec3(.011,.010,.015)*(n*.65+m*.35)+vec3(.009,.008,.011)*pools;
 float star=pow(max(0.,hash(floor((p+4.)*65.))-.998)/.002,3.)*(1.-smoothstep(.03,.12,length(fract((p+4.)*65.)-.5)))*.025;
 vec2 cover=vec2(min(1.,aspect/plateAspect),min(1.,plateAspect/aspect));
 vec2 at=.5+(vUv-.5)*cover*.96+pan*.42;
 at+=warp*.004;
 vec3 painting=texture2D(plate,clamp(at,vec2(.002),vec2(.998))).rgb;
 // Fine luminance variation stays subordinate to the painted masses.
 float grain=noise(p*110.+warp*10.);
 painting*=.98+grain*.04;
 float grey=dot(painting,vec3(.2126,.7152,.0722));
 wine=wine*.32+painting*.88+vec3(.009,.003,.004)*center;
 ash=ash*.55+vec3(.88,.85,1.)*grey*.62;
 vec3 c=mix(wine,ash+star,transition);
 float a=opacity;
 if(layer>.5&&layer<2.5){float side=layer<1.5?1.-smoothstep(.18,.52,vUv.x):smoothstep(.48,.82,vUv.x);float border=1.-smoothstep(.28,.63,abs(vUv.y-.5));a*=side*border*smoothstep(.006,.10,grey);}
 if(layer>2.5){float edge=smoothstep(.15,.65,length((vUv-.5)*vec2(1.,.8)));a*=edge*smoothstep(.43,.78,m)*.6;c=mix(vec3(.12,.025,.04),vec3(.07,.065,.09),transition);}
 gl_FragColor=vec4(c,a);
 #include <colorspace_fragment>
 }`;
 const uniforms={time:clock,transition,pan,aspect,plateAspect,opacity:{value:1},layer:{value:0},plate:{value:photo.material.map}};
 const original=photo.material,map=original.map;
 const initialSource=creationNebulaURL();let requestedSource=initialSource,plateRequest=0;
 function syncPlate(){
  if(!map.image?.width)return;
  const wanted=creationNebulaURL();if(wanted===requestedSource)return;
  requestedSource=wanted;const id=++plateRequest,image=new Image();
  image.onload=()=>{if(id!==plateRequest)return;map.image=image;map.needsUpdate=true;};
  image.onerror=()=>console.warn('Não foi possível trocar a atmosfera:',wanted);
  image.src=wanted;
 }
 photo.material=new THREE.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,toneMapped:false,
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy*2.,.999,1.);}',fragmentShader});
 photo.material.map=map;original.dispose();
 const state={active:0,loaded:4,transition:0,parallaxEnabled:parallaxEnabled&&!reducedMotion,parallaxStrength:1,foregroundEnabled:true};
 const layers=[-280,-160,-65].map((z,i)=>{
  const m=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,
   uniforms:{...uniforms,pan:{value:new THREE.Vector2()},map:{value:map},layer:{value:i+1},opacity:{value:i===2?.12:.24}},
   vertexShader:'varying vec2 vUv;void main(){vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);vUv=p.xy/p.w*.5+.5;gl_Position=p;}',fragmentShader});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),m);mesh.position.z=z;mesh.renderOrder=3+i*.1;mesh.userData={volumeFragment:true,baseX:0,baseY:0,parallaxOffsetX:0,parallaxOffsetY:0};scene.add(mesh);return mesh;
 });
 function resize(){for(const mesh of layers){const d=26-mesh.position.z,h=2*Math.tan(26*Math.PI/180)*d*1.5;mesh.scale.set(h*innerWidth/innerHeight,h,1);}}
 function update(time,x,y,delta){clock.value=reducedMotion?0:time;aspect.value=innerWidth/innerHeight;syncPlate();if(map.image?.width)plateAspect.value=map.image.width/map.image.height;
  const gain=1-Math.exp(-Math.min(.1,Math.max(0,delta))*2.4);
  pan.value.x+=((state.parallaxEnabled?-x*.004:0)-pan.value.x)*gain;pan.value.y+=((state.parallaxEnabled?-y*.003:0)-pan.value.y)*gain;
  layers.forEach((mesh,i)=>{const d=mesh.userData;d.parallaxOffsetX+=((state.parallaxEnabled?-x*(.7+i*.45)*state.parallaxStrength:0)-d.parallaxOffsetX)*gain;d.parallaxOffsetY+=((state.parallaxEnabled?-y*(.45+i*.3):0)-d.parallaxOffsetY)*gain;mesh.position.x=d.parallaxOffsetX;mesh.position.y=d.parallaxOffsetY;mesh.material.uniforms.pan.value.set(pan.value.x+d.parallaxOffsetX*.004,pan.value.y+d.parallaxOffsetY*.004);});
 }
 const ready=new Promise((resolve,reject)=>{if(map.image?.complete&&map.image.naturalWidth){resolve(true);return;}const image=new Image();image.onload=()=>resolve(true);image.onerror=()=>reject(new Error('Falha ao carregar a atmosfera de tinta.'));image.src=initialSource;});
 return {ready,layers,state,resize,update,applyQuality(q){state.active=['eco','lite'].includes(q)?2:3;layers.forEach((l,i)=>l.visible=i<state.active)},setTransition(v){transition.value=v;state.transition=v;},setParallaxStrength(v){state.parallaxStrength=THREE.MathUtils.clamp(v,.45,1.6)}};
}

export function createCreationArt({scene,camera,panel,reducedMotion=false,environment}){
 const loader=new THREE.TextureLoader(),textures={},meshes={},rigs={};
 const root=new THREE.Group();root.name='CreationCinematicLayers';scene.add(root);
 const state={rigMode:'image-skinned-2.5D',joints:48,fieldLayers:0,bindingType:'knowledge-sigils',bindingLayers:SIGIL_ORBITS.length,ready:false,phase:'sealed',releaseProgress:0,selected:null,surfaces:0,fragments:0,particleCount:64,gestureFromMark:false};
 let introStart=null,start=null,resolveRelease=null,aim={x:0,y:0},lastLayout=0,hovered=null;
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
 const atlasUV={baby:[.1494140625,.17578125,.69140625,.6966145833],menina:[.130208333,.0390625,.33203125,.9375],menino:[.572916667,.0390625,.302734375,.9375]};
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
  for(const [name,selector]of [['baby','.baby-target'],['orbit','.sealed-being'],['menina','[data-gender="menina"]'],['menino','[data-gender="menino"]']])rects[name]=panel.querySelector(selector).getBoundingClientRect();
 }
 function update(now){
  if(!state.ready)return;
  for(const [name,mesh]of Object.entries(meshes)){const u=mesh.material.uniforms.uHover;u.value=THREE.MathUtils.lerp(u.value,hovered===name?1:0,reducedMotion?1:.15);}
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
 return {ready,state,update,release,get meshes(){return meshes},rigs,bindings,hover(value){hovered=value},select(value){state.selected=value},point(value){aim=value},dispose(){scene.remove(root);bindings.dispose();for(const r of Object.values(rigs))r.dispose();pg.dispose();pm.dispose();for(const m of Object.values(meshes))m.material.dispose();for(const t of Object.values(textures))t.dispose();}};
}
