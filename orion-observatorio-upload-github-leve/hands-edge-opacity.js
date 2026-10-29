import * as THREE from 'three';
// Screen-space opacity follows the animated/rigged hand without changing its
// silhouette, pose, texture or draw count. Drawing-buffer size also handles Eco.
export function createHandEdgeOpacity(){
 const viewport=new THREE.Vector2(1,1);
 function material(value){
  value.onBeforeCompile=shader=>{
   shader.uniforms.uHandViewport={value:viewport};
   shader.fragmentShader='uniform vec2 uHandViewport;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>',`vec2 handScreen=gl_FragCoord.xy/max(uHandViewport,vec2(1.));
    float handEdge=min(min(handScreen.x,1.-handScreen.x),min(handScreen.y,1.-handScreen.y));
    float handPresence=1.-smoothstep(.02,.32,handEdge);
    diffuseColor.a*=mix(1.,2.5,handPresence);
    #include <alphatest_fragment>`);
  };
  value.customProgramCacheKey=()=> 'orion-hand-edge-v24';value.userData.edgeOpacity=true;return value;
 }
 return{material,bind(mesh){mesh.onBeforeRender=renderer=>renderer.getDrawingBufferSize(viewport);}};
}
