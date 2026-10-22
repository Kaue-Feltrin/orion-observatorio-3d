import assert from 'node:assert/strict';
import * as THREE from 'three';
import {mobileHeraldLayout} from '../mobile-constellation.js';
for(const [width,height] of [[320,568],[390,844],[568,320],[844,390]])for(const count of [1,2,3])for(let index=0;index<count;index++)for(const summary of [0,1]){
 const aspect=width/height,camera=new THREE.PerspectiveCamera(52,aspect,.2,900);camera.position.set(index*8,0,26);camera.updateMatrixWorld();
 const layout=mobileHeraldLayout(count,aspect,index,summary),p=layout[index];
 const point=new THREE.Vector3(p.x,p.y,p.z).project(camera),x=(point.x+1)*width/2,y=(1-point.y)*height/2;
 assert.ok(Math.abs(x/width-(aspect>1?.5-.22*summary:.5))<1e-10,'estrela central ou ao lado do resumo na paisagem');
 assert.ok(y>80&&y<height*.5,'estrela fora do cabeçalho e acima da área inferior');
 for(let i=0;i<count;i++)if(i!==index){const other=new THREE.Vector3(layout[i].x,layout[i].y,layout[i].z).project(camera);assert.ok(Math.abs(other.x)>1,'uma estrela visível por vez');}
 assert.ok(p.scale>=.65&&p.scale<=1);assert.equal(p.z,-470);
}
console.log('OK: uma estrela em destaque, centro/resumo seguros e enquadramento em retrato/paisagem para 1–3 destinos.');
