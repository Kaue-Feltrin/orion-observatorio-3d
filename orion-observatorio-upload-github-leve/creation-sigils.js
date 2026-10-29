import * as THREE from 'three';

export const SIGIL_PHRASE='Acorrentado pela realidade';
export const SIGIL_FONT_URL='/fonts/SigilosDeConhecimento.ttf';
export const SIGIL_FONT_FAMILY='OrionKnowledge';
export const SIGIL_ORBITS=[
 {tilt:.52,slope:.95,radius:.46,speed:.115},
 {tilt:-.46,slope:1.12,radius:.44,speed:-.087},
 {tilt:.12,slope:.42,radius:.47,speed:.065},
 {tilt:1.05,slope:.92,radius:.45,speed:-.055},
 {tilt:-1.08,slope:.86,radius:.43,speed:.095}
];
// The font has no middle-dot glyph: gaps separate complete copies of the phrase.
export function sigilSlots(){
 const letters=SIGIL_PHRASE+'   ';
 return SIGIL_ORBITS.flatMap((_,ring)=>Array.from(letters.repeat(2)).map((char,slot)=>({char,ring,slot,slots:letters.length*2}))).filter(s=>s.char!==' ');
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
 const orbitGLSL=SIGIL_ORBITS.map((o,i)=>`${i?'else ':''}if(ring<${(i+.5).toFixed(1)})return vec4(${o.tilt},${o.slope},${o.radius},${o.speed});`).join('');
 const vertexShader=`attribute float aAngle,aRing,aCell,aSeed;uniform float uTime,uRelease;varying vec2 vUv;varying float vDepth,vSeed,vCell;
 vec4 orbitConfig(float ring){${orbitGLSL}return vec4(0.,1.,.46,.1);}
 vec3 orbit(float angle,float ring){vec4 o=orbitConfig(ring);vec3 p=vec3(cos(angle)*o.z,sin(angle)*o.z*cos(o.y),sin(angle)*o.z*sin(o.y));return vec3(p.x*cos(o.x)-p.y*sin(o.x),p.x*sin(o.x)+p.y*cos(o.x),p.z);}
 void main(){float speed=orbitConfig(aRing).w;float angle=aAngle+uTime*speed+aRing*.7;
 vec3 center=orbit(angle,aRing);vec3 tangent=orbit(angle+.002,aRing)-center;float rotation=atan(tangent.y,tangent.x);
 float release=smoothstep(.02+aSeed*.12,.9,uRelease);float spread=release*release*(.35+aSeed*.5);
 center+=normalize(center)*spread;center.y-=release*release*.12;
 rotation+=release*(aSeed-.5)*2.;mat2 turn=mat2(cos(rotation),sin(rotation),-sin(rotation),cos(rotation));
 float compression=max(.28,length(tangent.xy)/max(.00001,length(tangent)));
 vec2 local=turn*(position.xy*vec2(.039*compression,.039));vec3 p=center+vec3(local,0.);
 vDepth=center.z;vUv=uv;vSeed=aSeed;vCell=aCell;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
 // Quantize the interpolated index before mod/floor: tiny GPU errors near
 // cell 8 otherwise select row 0 instead of row 1 while a glyph moves.
 const fragmentShader=`uniform sampler2D uMap;uniform float uFront,uOpacity,uRelease,uCharge,uTime;varying vec2 vUv;varying float vDepth,vSeed,vCell;
 void main(){float cellIndex=floor(vCell+.5);vec2 cell=vec2(mod(cellIndex,8.),floor(cellIndex/8.));vec2 at=vec2((cell.x+vUv.x)/8.,1.-(cell.y+1.-vUv.y)/4.);vec4 stencil=texture2D(uMap,at);float glyph=stencil.r;float halo=stencil.g*.72+stencil.b*.62;
 float side=smoothstep(-.013,.013,vDepth);float mask=mix(1.-side,side,uFront);float fade=1.-smoothstep(.35+vSeed*.2,1.,uRelease);
 float alpha=max(glyph,halo*.85)*mask*uOpacity*fade;if(alpha<.006)discard;
 float breathe=.94+.06*sin(uTime*.8+vSeed*6.);vec3 gold=mix(vec3(1.04,.56,.10),vec3(1.95,1.20,.30),uFront*.65+.15)*breathe*(1.+uCharge*.9);gold*=mix(.70,1.15,smoothstep(.05,.8,glyph));
 gl_FragColor=vec4(gold,alpha);
 #include <colorspace_fragment>
 }`;
 const materials=[];
 const meshes=[false,true].map(front=>{const m=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,forceSinglePass:true,uniforms:{...uniforms,uFront:{value:front?1:0}},vertexShader,fragmentShader});materials.push(m);const mesh=new THREE.Mesh(geometry,m);mesh.frustumCulled=false;mesh.renderOrder=front?14:8;mesh.layers.enable(1);root.add(mesh);return mesh;});
 const ambientSlots=slots.filter((_,i)=>i%5===0),ambientData=createSigilGeometry(ambientSlots),anchors=[];
 ambientSlots.forEach((_,i)=>{const side=i%2?1:-1;anchors.push(side*(.86+(i%3)*.022),-.82+Math.floor(i/2)/24*1.64,0);});
 ambientData.geometry.setAttribute('aCell',new THREE.InstancedBufferAttribute(new Float32Array(ambientSlots.map(s=>chars.indexOf(s.char))),1));
 ambientData.geometry.setAttribute('aAnchor',new THREE.InstancedBufferAttribute(new Float32Array(anchors),3));
 const ambientUniforms={uMap:uniforms.uMap,uTime:{value:0},uOpacity:{value:0},uAspect:{value:1}};
 const ambientMaterial=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending,uniforms:ambientUniforms,
  vertexShader:`attribute vec3 aAnchor;attribute float aCell,aSeed;uniform float uTime,uAspect;varying vec2 vUv;varying float vCell,vSeed;
  void main(){vUv=uv;vCell=aCell;vSeed=aSeed;float a=sin(uTime*.07+aSeed*6.)*.16;mat2 turn=mat2(cos(a),sin(a),-sin(a),cos(a));vec2 at=aAnchor.xy+vec2(sin(uTime*.09+aSeed*13.),cos(uTime*.06+aSeed*9.))*.006;vec2 size=vec2(.028/max(.3,uAspect),.028)*(.65+aSeed*.4);gl_Position=vec4(at+turn*(position.xy*size),0.,1.);}`,
  fragmentShader:`uniform sampler2D uMap;uniform float uTime,uOpacity;varying vec2 vUv;varying float vCell,vSeed;
  void main(){float index=floor(vCell+.5);vec2 cell=vec2(mod(index,8.),floor(index/8.));vec2 at=vec2((cell.x+vUv.x)/8.,1.-(cell.y+1.-vUv.y)/4.);vec4 glyph=texture2D(uMap,at);float light=.76+.24*sin(uTime*.35+vSeed*12.);float alpha=max(glyph.r,glyph.g*.55+glyph.b*.4)*uOpacity*light*(.45+vSeed*.55);if(alpha<.003)discard;gl_FragColor=vec4(.95,.72,.38,alpha);}`});
 const atmosphere=new THREE.Mesh(ambientData.geometry,ambientMaterial);atmosphere.name='KnowledgeMistGlyphs';atmosphere.frustumCulled=false;atmosphere.renderOrder=5;atmosphere.visible=false;
 let texture,face,disposed=false;
 const state={phrase:SIGIL_PHRASE,fontFamily:SIGIL_FONT_FAMILY,fontURL:SIGIL_FONT_URL,loaded:false,glyphs:slots.length,rings:SIGIL_ORBITS.length,time:0,release:0,reducedMotion,glowAtlasPacked:true,ambientGlyphs:ambientSlots.length,ambientVisible:false};
 const ready=(async()=>{
  face=new FontFace(SIGIL_FONT_FAMILY,`url("${SIGIL_FONT_URL}")`);await face.load();if(disposed)return false;document.fonts.add(face);
  // Only rasterize after the actual supplied font is ready. No fallback letters.
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.font=`192px "${SIGIL_FONT_FAMILY}"`;
  const metrics=chars.map(char=>ctx.measureText(char));
  const fontSize=192*Math.min(208/Math.max(...metrics.map(m=>m.width)),208/Math.max(...metrics.map(m=>m.actualBoundingBoxAscent+m.actualBoundingBoxDescent)));
  ctx.font=`${fontSize}px "${SIGIL_FONT_FAMILY}"`;
  chars.forEach((char,i)=>{const box=ctx.measureText(char),x=i%8*256+128,y=Math.floor(i/8)*256+128+(box.actualBoundingBoxAscent-box.actualBoundingBoxDescent)/2;ctx.fillText(char,x,y);});
  // One atlas sample supplies the exact core and two precomputed glow widths.
  // Opaque packing avoids Canvas premultiplication erasing halo RGB at alpha 0.
  const core=ctx.getImageData(0,0,canvas.width,canvas.height).data,blurred=[];
  for(const radius of [5,8]){const layer=document.createElement('canvas');layer.width=canvas.width;layer.height=canvas.height;const c=layer.getContext('2d');c.filter=`blur(${radius}px)`;c.drawImage(canvas,0,0);blurred.push(c.getImageData(0,0,layer.width,layer.height).data);}
  const packed=document.createElement('canvas');packed.width=canvas.width;packed.height=canvas.height;const packedCtx=packed.getContext('2d'),image=packedCtx.createImageData(packed.width,packed.height);
  for(let i=0;i<core.length;i+=4){image.data[i]=core[i+3];image.data[i+1]=blurred[0][i+3];image.data[i+2]=blurred[1][i+3];image.data[i+3]=255;}
  packedCtx.putImageData(image,0,0);
  texture=new THREE.CanvasTexture(packed);texture.colorSpace=THREE.NoColorSpace;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;uniforms.uMap.value=texture;state.loaded=true;return true;
 })();
 function update(fracture,charge,opacity,time=0){const t=reducedMotion?0:time;uniforms.uTime.value=t;uniforms.uRelease.value=reducedMotion?0:fracture;uniforms.uCharge.value=charge;uniforms.uOpacity.value=opacity*(reducedMotion?1-fracture:1);root.visible=state.loaded&&opacity>.001&&fracture<1;state.time=t;state.release=fracture;}
 function setAtmosphere(progress,time=0,aspect=1){ambientUniforms.uTime.value=reducedMotion?0:time;ambientUniforms.uAspect.value=aspect;ambientUniforms.uOpacity.value=Math.max(0,Math.min(1,progress))*.20;atmosphere.visible=state.loaded&&progress>.001;state.ambientVisible=atmosphere.visible;}
 return {root,atmosphere,setAtmosphere,front:meshes[1],back:meshes[0],count:slots.length,state,ready,update,dispose(){disposed=true;root.remove(...meshes);geometry.dispose();materials.forEach(m=>m.dispose());ambientData.geometry.dispose();ambientMaterial.dispose();texture?.dispose();if(face)document.fonts.delete(face);}};
}
