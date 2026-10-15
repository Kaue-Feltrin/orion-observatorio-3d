// Nebulosa Viva · v0.8.2
// Cinco planos de gas translucido criados em GLSL, sem alterar a fotografia ESO.
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uFlow;
  uniform float uDensity;
  uniform float uStrength;
  uniform float uSeed;
  uniform vec3 uCool;
  uniform vec3 uWarm;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = .5;
    for (int i = 0; i < 5; ++i) {
      v += a * noise2(p);
      p = p * 2.03 + vec2(3.73, 4.17);
      a *= .5;
    }
    return v;
  }
  void main() {
    vec2 uv = vUv;
    float motion = uTime * uFlow;
    vec2 drift = vec2(motion * .012, -motion * .006);
    // So a nuvem e deformada. A imagem principal da ESO nunca usa este shader.
    float domain = fbm(uv * 2.9 + drift + vec2(uSeed, uSeed * .34));
    vec2 advected = uv * vec2(4.6, 3.7) + vec2(domain * .62, -domain * .37);
    advected += drift;
    float body = fbm(advected + uSeed * .13);
    float wisps = fbm(advected * 2.8 + vec2(.0, motion * .014));
    float horizontal = uv.y - (.51 + .08 * sin(uv.x * 5.4 + uSeed));
    float band = exp(-horizontal * horizontal * 10.5);
    float edges = smoothstep(.01, .22, uv.x) * smoothstep(.01, .22, 1.0-uv.x)
      * smoothstep(.02, .18, uv.y) * smoothstep(.02, .18, 1.0-uv.y);
    float volume = smoothstep(.45, .68, body);
    float threads = smoothstep(.57, .78, wisps) * smoothstep(.35, .76, body);
    float alpha = (volume * .68 + threads * .32) * band * edges
      * uDensity * uStrength;
    vec3 color = mix(uCool, uWarm, clamp(body * .85 + threads * .24, 0.0, 1.0));
    color *= .68 + .56 * threads;
    gl_FragColor = vec4(color, clamp(alpha, 0.0, .23));
    #include <colorspace_fragment>
  }
`;

const specs = [
  { name:'07 · Gás profundo', z:-225, x:-20, y:6, aspect:2.72, factor:1.55, order:2.6, opacity:.44, seed:1.7, cool:'#314778', warm:'#7853a8' },
  { name:'08 · Filamentos violetas', z:-195, x:12, y:-6, aspect:2.72, factor:1.54, order:3.3, opacity:.57, seed:8.3, cool:'#403d80', warm:'#ac70c5' },
  { name:'09 · Nuvens intermediárias', z:-169, x:-9, y:1, aspect:2.66, factor:1.50, order:3.7, opacity:.51, seed:13.6, cool:'#345a91', warm:'#8d59a8' },
  { name:'10 · Reflexos no gás', z:-112, x:5, y:-4, aspect:2.55, factor:1.56, order:4.6, opacity:.35, seed:23.8, cool:'#406aa3', warm:'#b47aab' },
  { name:'11 · Véu próximo', z:-73, x:13, y:-10, aspect:2.52, factor:1.65, order:5.3, opacity:.28, seed:31.2, cool:'#343d77', warm:'#6b578e' },
];

export function createCosmicAtmosphere(scene, { reducedMotion=false }={}) {
  const state = { density:.82, flow:.42, bloom:.48 };
  const layers = [];
  for (const spec of specs) {
    const material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader, transparent:true,
      depthTest:false, depthWrite:false,
      blending:THREE.AdditiveBlending,
      side:THREE.DoubleSide, toneMapped:false,
      uniforms: {
        uTime: {value:0},
        uFlow: {value: reducedMotion ? 0 : state.flow},
        uDensity: {value:state.density},
        uStrength: {value:spec.opacity},
        uSeed: {value:spec.seed},
        uCool: {value:new THREE.Color(spec.cool)},
        uWarm: {value:new THREE.Color(spec.warm)},
      }
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1,1), material);
    mesh.position.set(spec.x,spec.y,spec.z);
    mesh.renderOrder = spec.order;
    mesh.userData.aspect = spec.aspect;
    mesh.userData.factor = spec.factor;
    mesh.userData.layerName = spec.name;
    scene.add(mesh);
    layers.push(mesh);
  }
  function update(time) {
    for (const layer of layers) {
      layer.material.uniforms.uTime.value = reducedMotion ? 0 : time;
      layer.material.uniforms.uFlow.value = reducedMotion ? 0 : state.flow;
      layer.material.uniforms.uDensity.value = state.density;
    }
  }
  function setDensity(value){state.density=THREE.MathUtils.clamp(value,0,1.5);}
  function setFlow(value){state.flow=THREE.MathUtils.clamp(value,0,1);}
  return { layers, state, update, setDensity, setFlow };
}
