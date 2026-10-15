// Bloom seletivo · mantém a fotografia ESO fora do pós-processamento.
// A cena principal continua sendo desenhada sem blur; só objetos na layer 1 brilham.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export function createSelectiveBloom(renderer,scene,camera,{initial=.48,reducedMotion=false}={}) {
  const state={intensity:reducedMotion ? .23 : initial};
  // Bloom roda em resolução separada e baixa; o fundo ESO continua full-res.
  const composer=new EffectComposer(renderer);
  composer.renderToScreen=false;
  composer.setPixelRatio(1);
  const pass=new UnrealBloomPass(new THREE.Vector2(512,288),.72,.30,.72);
  composer.addPass(new RenderPass(scene,camera));
  composer.addPass(pass);
  const overlayScene=new THREE.Scene();
  const overlayCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const overlayMaterial=new THREE.ShaderMaterial({
    depthTest:false,depthWrite:false,transparent:true,
    blending:THREE.AdditiveBlending,toneMapped:false,
    uniforms:{uTexture:{value:null},uOpacity:{value:state.intensity}},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`,
    fragmentShader:`uniform sampler2D uTexture; uniform float uOpacity;varying vec2 vUv;
      void main(){vec3 c=texture2D(uTexture,vUv).rgb;gl_FragColor=vec4(c*uOpacity,1.0);}`
  });
  overlayScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),overlayMaterial));

  function resize(width,height,scale=.34){
    const ratio=THREE.MathUtils.clamp(scale,.20,.50);
    composer.setSize(Math.max(64,Math.floor(width*ratio)), Math.max(64,Math.floor(height*ratio)));
  }
  function render(refreshBloom=true){
    // Renderizar a névoa luminosa a meia frequência economiza GPU.
    // A cena principal e o movimento da câmera continuam por quadro.
    if(refreshBloom){
      camera.layers.set(1);
      composer.render();
      camera.layers.set(0);
      overlayMaterial.uniforms.uTexture.value=composer.readBuffer.texture;
    }
    renderer.setRenderTarget(null);
    renderer.render(scene,camera);
    const oldAutoClear=renderer.autoClear;
    renderer.autoClear=false;
    renderer.render(overlayScene,overlayCamera);
    renderer.autoClear=oldAutoClear;
  }
  function setIntensity(value){
    state.intensity=THREE.MathUtils.clamp(value,0,1.5);
    overlayMaterial.uniforms.uOpacity.value=state.intensity;
  }
  return {state,render,resize,setIntensity};
}
