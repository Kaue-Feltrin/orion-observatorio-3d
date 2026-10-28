import * as THREE from 'three';
export const ATMOSPHERE_LAYERS=[
 {file:'/assets/creation/gray-far-v9.png',kind:'gray-far',z:-280,opacity:.30},
 {file:'/assets/creation/gray-near-v9.png',kind:'gray-near',z:-180,opacity:.21},
 {file:'/assets/creation/red-left-v9.png',kind:'red-left',z:-110,opacity:.64},
 {file:'/assets/creation/red-right-v9.png',kind:'red-right',z:-65,opacity:.59}
];
// Slow double beat, continuous derivatives at each wrap. No flash/strobe.
export function bloodBeat(seconds,phase=0){const angle=seconds*2*Math.PI/4.8+phase;return .72+.22*Math.pow((Math.sin(angle)+1)/2,4)+.06*Math.pow((Math.sin(angle+.9)+1)/2,12);}
export function createCreationNebula(scene,photo,{reducedMotion=false,parallaxEnabled=true}={}){
 const original=photo.material,first=original.map;original.dispose();
 // Black foundation is deliberately independent of all four alpha images.
 photo.material=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{},vertexShader:'void main(){gl_Position=vec4(position.xy*2.,.999,1.);}',fragmentShader:'void main(){gl_FragColor=vec4(0.,0.,0.,1.);}'});photo.material.map=first;
 const state={active:4,loaded:0,components:5,transition:0,parallaxEnabled:parallaxEnabled&&!reducedMotion,parallaxStrength:1,foregroundEnabled:true,pulse:[0,0],reducedMotion};
 const loader=new THREE.TextureLoader(),layers=[];
 const vertexShader='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy*2.,.998,1.);}';
 const fragmentShader=`uniform sampler2D map;uniform vec2 pan;uniform float aspect,plateAspect,time,transition,opacity,red,phase,beat;varying vec2 vUv;
 void main(){vec2 cover=vec2(min(1.,aspect/plateAspect),min(1.,plateAspect/aspect));vec2 at=.5+(vUv-.5)*cover*.96;
 float portrait=1.-smoothstep(.75,1.2,aspect);at.x+=red*.23*portrait*(phase<.5?-1.:1.);
 vec2 anchor=vec2(phase<.5?.20:.80,phase<.5?.25:.78);float live=(beat-.72)*red*(1.-transition);
 at=anchor+(at-anchor)/(1.+live*.045);at+=pan;
 vec4 cloud=texture2D(map,clamp(at,vec2(.001),vec2(.999)));float grey=dot(cloud.rgb,vec3(.2126,.7152,.0722));
 vec3 color=cloud.rgb;float strength=mix(1.,beat,red);
 color=mix(color,grey*vec3(.82,.80,.95),transition);color*=mix(1.,1.+live*.45,red);
 float alpha=cloud.a*opacity*strength;gl_FragColor=vec4(color,alpha);
 #include <colorspace_fragment>
 }`;
 const ready=Promise.all(ATMOSPHERE_LAYERS.map(async(spec,i)=>{
  const t=await loader.loadAsync(spec.file);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;
  const m=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,uniforms:{map:{value:t},pan:{value:new THREE.Vector2()},aspect:{value:innerWidth/innerHeight},plateAspect:{value:t.image.width/t.image.height},time:{value:0},transition:{value:0},opacity:{value:spec.opacity},red:{value:i>1?1:0},phase:{value:i===3?1:0},beat:{value:.82}},vertexShader,fragmentShader});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),m);mesh.position.z=spec.z;mesh.frustumCulled=false;mesh.renderOrder=3+i*.1;mesh.userData={kind:spec.kind,volumeFragment:true,baseX:0,baseY:0,parallaxOffsetX:0,parallaxOffsetY:0};layers[i]=mesh;scene.add(mesh);state.loaded++;return true;
 }));
 function update(time,x,y,delta){const gain=1-Math.exp(-Math.min(.1,Math.max(0,delta))*2.4);state.pulse=[0,1].map(p=>reducedMotion?.82:bloodBeat(time,p));
  layers.forEach((l,i)=>{if(!l)return;const d=l.userData,u=l.material.uniforms;d.parallaxOffsetX+=((state.parallaxEnabled?-x*(.7+i*.25)*state.parallaxStrength:0)-d.parallaxOffsetX)*gain;d.parallaxOffsetY+=((state.parallaxEnabled?-y*(.40+i*.18)*state.parallaxStrength:0)-d.parallaxOffsetY)*gain;u.pan.value.set(d.parallaxOffsetX*.004,d.parallaxOffsetY*.004);u.aspect.value=innerWidth/innerHeight;u.time.value=reducedMotion?0:time;u.transition.value=state.transition;u.beat.value=i<2?1:THREE.MathUtils.lerp(state.pulse[i-2],.82,state.transition);});
 }
 return{ready,layers,state,resize(){},update,applyQuality(){state.active=4;},setTransition(v){state.transition=v;},setParallaxStrength(v){state.parallaxStrength=THREE.MathUtils.clamp(v,.45,1.6)}};
}
