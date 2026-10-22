import assert from 'node:assert/strict';
import * as THREE from 'three';
import sharp from 'sharp';
import {entry} from './hands-silhouette.mjs';
import {createEtherealHandsMesh} from '../first-person-hands-mesh.js';

const assets=await Promise.all(['left-hand-ethereal.webp','right-hand-pointing-smooth.webp'].map(file=>
  sharp(new URL('../public/overlay/'+file,import.meta.url).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true})));
const load=THREE.TextureLoader.prototype.load;
THREE.TextureLoader.prototype.load=function(file,onLoad){
  queueMicrotask(()=>onLoad(new THREE.Texture({width:1122,height:1402})));
};
try{
  for(const [width,height] of [[1920,1080],[1920,951],[390,844]])for(const animation of ['mesh','rig','perspective']){
    const camera=new THREE.PerspectiveCamera(52,width/height,.2,900);
    const hands=createEtherealHandsMesh(camera,{animation,reducedMotion:true});await hands.ready;
    const [left,right]=hands.meshes;
    const visibleRight=animation==='perspective'?right:hands.root.getObjectByName('OrionFeminineRightNeutral');
    assert.equal(left.material.opacity,.38);assert.equal(visibleRight.material.opacity,.38);
    assert.deepEqual(left.scale,right.scale,'mesma escala horizontal e vertical nos três enquadramentos');
    assert.ok(left.position.x<0&&right.position.x>0,'uma mão em cada lateral');
    assert.equal(left.position.y,right.position.y,'mesma altura de ancoragem');
    assert.equal(left.position.z,right.position.z);
    if(animation==='perspective'){
      camera.updateMatrixWorld();
      const edges=hands.meshes.map((mesh,i)=>entry(mesh,camera,assets[i]));
      assert.ok(edges.every(e=>e.count>0),'ambos os braços entram pelas laterais');
      assert.ok(edges[0].silhouetteRight<.30&&edges[1].silhouetteLeft>.70,'alpha visível protege o centro');
      assert.ok(Math.abs(edges[0].top-edges[1].top)<.012,'topos visíveis alinhados');
      assert.ok(Math.abs(edges[0].bottom-edges[1].bottom)<.012,'bases visíveis alinhadas');
      if(width>1000)assert.ok(edges.every(e=>e.bottom<.99),'entrada lateral sem alcançar o canto inferior');
    }
    const start=left.position.clone();hands.setStarHovered(true);hands.update(0,1/60);
    assert.equal(hands.state.leftFollow,0,'reduced-motion não movimenta a esquerda');
    assert.deepEqual(left.position,start);assert.equal(hands.state.rightDepth,0);
    if(animation==='perspective')assert.equal(hands.state.rightBlend,.60);
    hands.dispose();
  }
  const camera=new THREE.PerspectiveCamera(52,1920/1080,.2,900);
  const hands=createEtherealHandsMesh(camera,{animation:'perspective'});await hands.ready;
  const left=hands.meshes[0],start=left.position.clone(),scale=left.scale.clone();
  const wrist=hands.rigs[0].bones[0],angle=wrist.rotation.z;
  const open=hands.rigs[0].measure();
  hands.setStarHovered(true);hands.update(0,1/60);
  assert.ok(hands.state.leftFollow>0&&hands.state.leftFollow<.1,'acompanhamento começa suavemente');
  for(let i=0;i<160;i++)hands.update(0,1/60);
  assert.ok(hands.state.leftFollow>.997);
  assert.ok(left.position.x>start.x&&left.position.y>start.y,'esquerda acompanha com aproximação e elevação pequenas');
  assert.ok(left.position.distanceTo(start)<.03,'acompanhamento discreto');
  assert.ok(wrist.rotation.z>angle+.011,'movimento real do punho no rig');
  assert.deepEqual(left.scale,scale,'acompanhar não estica a mão');
  const closed=hands.rigs[0].measure();
  const aperture=pose=>pose.landmarks.indexTip.distanceTo(pose.landmarks.thumbTip);
  assert.ok(aperture(closed)<aperture(open)*.85,'fecha visivelmente o arco entre indicador e polegar');
  for(const finger of ['indexTip','middleTip','ringTip'])
    assert.ok(closed.landmarks[finger].distanceTo(closed.landmarks.palm)<open.landmarks[finger].distanceTo(open.landmarks.palm),finger+' aproxima da palma');
  const rig=hands.rigs[0],g=rig.mesh.geometry,uv=g.attributes.uv,index=g.index;
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();let min=Infinity,max=0;
  for(let step=0;step<=40;step++)for(const time of [0,1.3,4.7,12]){
    rig.update(time,false,0,step/40);rig.mesh.updateMatrixWorld(true);
    for(let j=0;j<index.count;j+=3){
      const i=index.getX(j),k=index.getX(j+1),m=index.getX(j+2);
      rig.mesh.getVertexPosition(i,a);rig.mesh.getVertexPosition(k,b);rig.mesh.getVertexPosition(m,c);
      const area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
      const base=(uv.getX(k)-uv.getX(i))*(uv.getY(m)-uv.getY(i))-(uv.getY(k)-uv.getY(i))*(uv.getX(m)-uv.getX(i));
      min=Math.min(min,area/base);max=Math.max(max,area/base);
    }
  }
  assert.ok(min>.10&&max<4,'fechamento sem inversão, colapso ou expansão excessiva');
  console.log('Fechamento esquerdo:',JSON.stringify({apertureRatio:aperture(closed)/aperture(open),minArea:min,maxArea:max}));
  hands.update(0,0);
  assert.ok(hands.state.rightBlend>.599&&hands.state.rightBlend<=.60);
  assert.ok(hands.state.rightDepth>.041&&hands.state.rightDepth<=.042);
  assert.equal(hands.meshes[0].material.opacity,hands.meshes[1].material.opacity);
  hands.setStarHovered(false);hands.update(0,1/60);
  assert.ok(hands.state.leftFollow>.9,'retorno começa sem salto');
  for(let i=0;i<160;i++)hands.update(0,1/60);
  assert.ok(left.position.distanceTo(start)<1e-6);assert.ok(Math.abs(wrist.rotation.z-angle)<1e-6);
  assert.ok(hands.state.rightBlend<.001);hands.dispose();
  console.log('OK: transparência/escala e entradas visíveis equilibradas, esquerda fecha/retorna, apontar/profundidade contidos e reduced-motion.');
}finally{THREE.TextureLoader.prototype.load=load;}
