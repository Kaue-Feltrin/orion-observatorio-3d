import * as THREE from 'three';

export const SIGIL_PHRASE='Acorrentado pela realidade';
export const SIGIL_FONT_URL='/fonts/SigilosDeConhecimento.ttf';
export const SIGIL_FONT_FAMILY='OrionKnowledge';
// The font has no middle-dot glyph: gaps separate complete copies of the phrase.
export function sigilSlots(){
 const letters=SIGIL_PHRASE+'   ';
 return [0,1].flatMap(ring=>Array.from(letters.repeat(2)).map((char,slot)=>({char,ring,slot,slots:letters.length*2}))).filter(s=>s.char!==' ');
}
export function createSigilGeometry(slots){
 const geometry=new THREE.InstancedBufferGeometry();const quad=new THREE.PlaneGeometry(1,1);
 geometry.index=quad.index.clone();geometry.attributes.position=quad.attributes.position.clone();geometry.attributes.uv=quad.attributes.uv.clone();quad.dispose();
 const chars=[...new Set(slots.map(s=>s.char))],positions=[],rings=[],cells=[],seeds=[];
 slots.forEach((s,i)=>{positions.push(s.slot/s.slots*Math.PI*2);rings.push(s.ring);cells.push(chars.indexOf(s.char));seeds.push((i*.6180339)%1);});
 for(const [name,data] of [['aAngle',positions],['aRing',rings],['aCell',cells],['aSeed',seeds]])geometry.setAttribute(name,new THREE.InstancedBufferAttribute(new Float32Array(data),1));
 geometry.instanceCount=slots.length;return {geometry,chars};
}
export function createCreationSigils({reducedMotion=false}={}){
 const root=new THREE.Group();root.name='AcorrentadoPelaRealidade';
 const slots=sigilSlots(),{geometry,chars}=createSigilGeometry(slots),uniforms={uMap:{value:null},uTime:{value:0},uRelease:{value:0},uCharge:{value:0},uOpacity:{value:0}};
 const vertexShader=`attribute float aAngle,aRing,aCell,aSeed;uniform float uTime,uRelease;varying vec2 vUv;varying float vDepth,vSeed,vCell;
 vec3 orbit(float angle,float ring){float tilt=ring<.5?.52:-.46;float slope=ring<.5?.95:1.12;vec3 p=vec3(cos(angle)*.46,sin(angle)*.46*cos(slope),sin(angle)*.46*sin(slope));return vec3(p.x*cos(tilt)-p.y*sin(tilt),p.x*sin(tilt)+p.y*cos(tilt),p.z);}
 void main(){float speed=aRing<.5?.115:-.087;float angle=aAngle+uTime*speed+aRing*.7;
 vec3 center=orbit(angle,aRing);vec3 tangent=orbit(angle+.002,aRing)-center;float rotation=atan(tangent.y,tangent.x);
 float release=smoothstep(.02+aSeed*.12,.9,uRelease);float spread=release*release*(.35+aSeed*.5);
 center+=normalize(center)*spread;center.y-=release*release*.12;
 rotation+=release*(aSeed-.5)*2.;mat2 turn=mat2(cos(rotation),sin(rotation),-sin(rotation),cos(rotation));
 float compression=max(.28,length(tangent.xy)/max(.00001,length(tangent)));
 vec2 local=turn*(position.xy*vec2(.052*compression,.052));vec3 p=center+vec3(local,0.);
 vDepth=center.z;vUv=uv;vSeed=aSeed;vCell=aCell;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
 const fragmentShader=`uniform sampler2D uMap;uniform float uFront,uOpacity,uRelease,uCharge,uTime;varying vec2 vUv;varying float vDepth,vSeed,vCell;
 void main(){vec2 cell=vec2(mod(vCell,8.),floor(vCell/8.));vec2 at=vec2((cell.x+vUv.x)/8.,1.-(cell.y+1.-vUv.y)/4.);float glyph=texture2D(uMap,at).a;
 float side=smoothstep(-.013,.013,vDepth);float mask=mix(1.-side,side,uFront);float fade=1.-smoothstep(.35+vSeed*.2,1.,uRelease);
 float alpha=glyph*mask*uOpacity*fade;if(alpha<.006)discard;
 float breathe=.94+.06*sin(uTime*.6+vSeed*6.);vec3 gold=mix(vec3(.42,.23,.065),vec3(.95,.70,.30),uFront*.65+.15)*breathe*(1.+uCharge*.9);
 gl_FragColor=vec4(gold,alpha);
 #include <colorspace_fragment>
 }`;
 const materials=[];
 const meshes=[false,true].map(front=>{const m=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,side:THREE.DoubleSide,forceSinglePass:true,uniforms:{...uniforms,uFront:{value:front?1:0}},vertexShader,fragmentShader});materials.push(m);const mesh=new THREE.Mesh(geometry,m);mesh.frustumCulled=false;mesh.renderOrder=front?14:8;mesh.layers.enable(1);root.add(mesh);return mesh;});
 let texture,face,disposed=false;
 const state={phrase:SIGIL_PHRASE,fontFamily:SIGIL_FONT_FAMILY,fontURL:SIGIL_FONT_URL,loaded:false,glyphs:slots.length,rings:2,time:0,release:0,reducedMotion};
 const ready=(async()=>{
  face=new FontFace(SIGIL_FONT_FAMILY,`url("${SIGIL_FONT_URL}")`);await face.load();if(disposed)return false;document.fonts.add(face);
  // Only rasterize after the actual supplied font is ready. No fallback letters.
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.font=`96px "${SIGIL_FONT_FAMILY}"`;
  const metrics=chars.map(char=>ctx.measureText(char));
  const fontSize=96*Math.min(104/Math.max(...metrics.map(m=>m.width)),104/Math.max(...metrics.map(m=>m.actualBoundingBoxAscent+m.actualBoundingBoxDescent)));
  ctx.font=`${fontSize}px "${SIGIL_FONT_FAMILY}"`;
  chars.forEach((char,i)=>{const box=ctx.measureText(char),x=i%8*128+64,y=Math.floor(i/8)*128+64+(box.actualBoundingBoxAscent-box.actualBoundingBoxDescent)/2;ctx.fillText(char,x,y);});
  texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.NoColorSpace;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;uniforms.uMap.value=texture;state.loaded=true;return true;
 })();
 function update(fracture,charge,opacity,time=0){const t=reducedMotion?0:time;uniforms.uTime.value=t;uniforms.uRelease.value=reducedMotion?0:fracture;uniforms.uCharge.value=charge;uniforms.uOpacity.value=opacity*(reducedMotion?1-fracture:1);root.visible=state.loaded&&opacity>.001&&fracture<1;state.time=t;state.release=fracture;}
 return {root,front:meshes[1],back:meshes[0],count:slots.length,state,ready,update,dispose(){disposed=true;root.remove(...meshes);geometry.dispose();materials.forEach(m=>m.dispose());texture?.dispose();if(face)document.fonts.delete(face);}};
}
