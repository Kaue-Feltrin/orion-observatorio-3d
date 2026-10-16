// Nebulosa em Volume · recortes transparentes da mesma fotografia ESO.
// Fotografia integral e estrelas continuam no plano traseiro, sem blur.
import * as THREE from 'three';
import {nebulaDepthSpecs} from './nebula-depth-specs.js';

export function createNebulaVolume(scene, mainPhoto,{reducedMotion=false}={}){
  const loader=new THREE.TextureLoader();
  const layers=nebulaDepthSpecs.map((spec,i)=>{
    const material=new THREE.MeshBasicMaterial({
      transparent:true,opacity:spec.opacity,depthTest:false,depthWrite:false,
      side:THREE.DoubleSide,blending:THREE.NormalBlending,toneMapped:false
    });
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);
    mesh.position.z=spec.z;
    mesh.renderOrder=2.11+i*.08;
    mesh.visible=false;
    mesh.userData.layerName='Foto ESO em volume · '+spec.name;
    mesh.userData.volumeFragment=true;
    mesh.userData.spec=spec;
    mesh.userData.loaded=false;
    scene.add(mesh);
    return mesh;
  });
  const state={active:0,loaded:0};
  function ensureTexture(mesh){
    if(mesh.userData.loaded)return;
    mesh.userData.loaded=true;
    const name=mesh.userData.spec.id;
    const texture=loader.load('/assets/depth/eso-gas-'+name+'.webp',undefined,undefined,err=>{
      console.warn('[Nebulosa em volume] falha ao carregar recorte',name,err);
      mesh.visible=false;
    });
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=1;
    texture.minFilter=THREE.LinearMipmapLinearFilter;
    texture.magFilter=THREE.LinearFilter;
    mesh.material.map=texture;
    mesh.material.needsUpdate=true;
    state.loaded++;
  }
  function applyQuality(quality){
    // A versão leve recebe apenas duas massas para limitar RAM/VRAM.
    const selected=['lite','eco','eco-plus'].includes(quality)?[1,3]:quality==='high'?[0,1,2,3]:[0,1,2];
    layers.forEach((mesh,i)=>{
      mesh.visible=selected.includes(i);
      if(mesh.visible)ensureTexture(mesh);
    });
    state.active=selected.length;
  }
  function resize(){
    // Reconstruir enquadramento a partir da projeção do panorama original,
    // sem deslocar a fotografia ESO nem forçar o mesmo movimento às 4 massas.
    const photoDistance=26-mainPhoto.position.z;
    for(const mesh of layers){
      const s=mesh.userData.spec;
      const ratio=(26-s.z)/photoDistance;
      mesh.userData.baseX=mainPhoto.position.x+(s.u-.5)*mainPhoto.scale.x*ratio;
      mesh.userData.baseY=mainPhoto.position.y+(.5-s.v)*mainPhoto.scale.y*ratio;
      mesh.position.x=mesh.userData.baseX;
      mesh.position.y=mesh.userData.baseY;
      mesh.scale.set(mainPhoto.scale.x*s.w*ratio*1.008,
        mainPhoto.scale.y*s.h*ratio*1.008,1);
    }
  }
  function update(time){
    for(const layer of layers){
      if(!layer.visible)continue;
      const spec=layer.userData.spec;
      const wave=reducedMotion?0:Math.sin(time*spec.rate+spec.phase);
      const drift=reducedMotion?0:Math.sin(time*spec.rate*.55+spec.phase*1.43);
      layer.position.x=layer.userData.baseX+drift*spec.drift;
      layer.position.y=layer.userData.baseY+wave*spec.drift*.32;
      layer.material.opacity=spec.opacity*(1+wave*.085);
    }
  }
  function dispose(){
    for(const mesh of layers){
      mesh.material.map?.dispose();
      mesh.material.dispose();
      mesh.geometry.dispose();
      scene.remove(mesh);
    }
  }
  return {layers,state,resize,update,applyQuality,dispose};
}
