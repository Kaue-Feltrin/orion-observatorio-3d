// Céu da viagem: translação angular da fotografia, sem perspectiva de parede.
// Reutiliza a malha, o material e a textura existentes; repouso não é alterado.
import * as THREE from 'three';
export const SKY_APPROACH_ZOOM=1.32;

export function createDistantSky(photo,camera){
  const uniforms={
    uSkyActive:{value:0},uSkyBasis:{value:new THREE.Matrix3()},
    uSkyEye:{value:new THREE.Vector2()},uSkyCenter:{value:new THREE.Vector2()},
    uSkySize:{value:new THREE.Vector2()},uSkyDistance:{value:1},
    uSkyTanHalf:{value:1},uSkyAspect:{value:camera.aspect},uSkyPan:{value:new THREE.Vector2()},uSkyZoom:{value:1}
  };
  const state={active:false,projection:'angular-sky',panX:0,panY:0,approach:0,zoom:1,newTextures:0,newSurfaces:0};
  const initialQ=new THREE.Quaternion(),inverseQ=new THREE.Quaternion(),relativeQ=new THREE.Quaternion();
  const eye=new THREE.Vector3(),center=new THREE.Vector3(),size=new THREE.Vector3(),shift=new THREE.Vector3();
  const rotation=new THREE.Matrix4(),angles=new THREE.Euler(0,0,0,'YXZ');
  // Compilado já no repouso, para não criar um programa no primeiro clique.
  photo.material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,uniforms);
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
      varying vec2 vSkyScreen;`).replace('#include <project_vertex>',`#include <project_vertex>
      vSkyScreen=gl_Position.xy/gl_Position.w;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying vec2 vSkyScreen;
      uniform float uSkyActive,uSkyDistance,uSkyTanHalf,uSkyAspect,uSkyZoom;
      uniform mat3 uSkyBasis;
      uniform vec2 uSkyEye,uSkyCenter,uSkySize,uSkyPan;`)
      .replace('#include <map_fragment>',`
      if(uSkyActive>.5){
        // A projeção de partida fica fixa. O giro acrescenta o mesmo
        // deslocamento angular a todos os pixels, sem cisalhar a fotografia.
        // Zoom uniforme no espaço da tela, centrado na direção de chegada.
        // A mesma escala nos dois eixos conserva o formato durante o giro.
        vec2 screen=vSkyScreen/uSkyZoom;
        vec3 ray=uSkyBasis*vec3(screen.x*uSkyTanHalf*uSkyAspect,screen.y*uSkyTanHalf,-1.);
        vec2 uv=(uSkyEye+ray.xy*uSkyDistance/max(.00001,-ray.z)-uSkyCenter)/uSkySize+.5+uSkyPan;
        vec4 sky=texture2D(map,clamp(uv,vec2(0.),vec2(1.)));
        // Fora da região fotografada há céu escuro, sem repetir/esticar bordas.
        vec2 edge=smoothstep(vec2(0.),vec2(.035),uv)*(1.-smoothstep(vec2(.965),vec2(1.),uv));
        sky.rgb=mix(vec3(.0006,.0004,.0012),sky.rgb,edge.x*edge.y);
        diffuseColor*=sky;
      }else{
        #include <map_fragment>
      }`);
  };
  photo.material.customProgramCacheKey=()=> 'orion-angular-sky-v2';
  photo.material.needsUpdate=true;
  function begin(){
    if(state.active)return false;
    camera.updateWorldMatrix(true,false);photo.updateWorldMatrix(true,false);
    camera.getWorldPosition(eye);camera.getWorldQuaternion(initialQ);inverseQ.copy(initialQ).invert();
    photo.getWorldPosition(center);photo.getWorldScale(size);
    uniforms.uSkyBasis.value.setFromMatrix4(rotation.makeRotationFromQuaternion(initialQ));
    uniforms.uSkyEye.value.set(eye.x,eye.y);uniforms.uSkyCenter.value.set(center.x,center.y);
    uniforms.uSkySize.value.set(size.x,size.y);uniforms.uSkyDistance.value=eye.z-center.z;
    uniforms.uSkyTanHalf.value=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    camera.add(photo);photo.quaternion.identity();uniforms.uSkyActive.value=1;state.active=true;
    update(0);return true;
  }
  function update(approach=state.approach){
    if(!state.active)return;
    state.approach=THREE.MathUtils.clamp(Number.isFinite(approach)?approach:0,0,1);
    state.zoom=1+(SKY_APPROACH_ZOOM-1)*state.approach;
    uniforms.uSkyZoom.value=state.zoom;
    camera.getWorldQuaternion(relativeQ);relativeQ.premultiply(inverseQ);
    angles.setFromQuaternion(relativeQ,'YXZ');
    shift.set(-angles.y,angles.x,0).applyQuaternion(initialQ);
    const distance=uniforms.uSkyDistance.value;
    uniforms.uSkyPan.value.set(shift.x*distance/size.x,shift.y*distance/size.y);
    state.panX=uniforms.uSkyPan.value.x;state.panY=uniforms.uSkyPan.value.y;
    uniforms.uSkyAspect.value=camera.aspect;
    const depth=Math.max(camera.near*2,Math.min(100,camera.far*.5));
    const height=2*depth*Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    photo.position.set(0,0,-depth);photo.scale.set(height*camera.aspect*1.0001,height*1.0001,1);
    photo.quaternion.identity();
  }
  return {begin,update,state,uniforms,photo};
}
