import assert from 'node:assert/strict';
import {MESH_COLS,MESH_ROWS,deformHandVertices} from '../hands-mesh-motion.js';
const make=(side)=>{
  const n=(MESH_COLS+1)*(MESH_ROWS+1),rest=new Float32Array(n*3),pos=new Float32Array(n*3),uv=new Float32Array(n*2);
  let i=0;
  for(let y=0;y<=MESH_ROWS;y++)for(let x=0;x<=MESH_COLS;x++){
    rest[i*3]=x/MESH_COLS-.5;rest[i*3+1]=y/MESH_ROWS-.5;
    uv[i*2]=x/MESH_COLS;uv[i*2+1]=y/MESH_ROWS;i++;
  }
  const max=deformHandVertices(rest,pos,uv,side,4,.7,-.2,false);
  assert.ok(max>0&&max<=.012,side+' maximum displacement');
  assert.equal(pos.length,rest.length);
  for(let j=0;j<n;j++){
    assert.ok(Math.abs(rest[j*3]-pos[j*3])<=.0121);
    assert.ok(Math.abs(rest[j*3+1]-pos[j*3+1])<=.0121);
    assert.equal(rest[j*3+2],pos[j*3+2]);
  }
  const original=new Float32Array(pos);
  deformHandVertices(rest,pos,uv,side,5,.1,.3,false);
  assert.notDeepEqual(Array.from(original),Array.from(pos),'animation evolves');
  deformHandVertices(rest,pos,uv,side,10,.9,.9,true);
  assert.deepEqual(Array.from(rest),Array.from(pos),'reduced motion completely stops bone-less deformation');
  return max;
};
const l=make('left'),r=make('right');
console.log('OK: continuous GPU-ready finger mesh weights; displacement bound',l.toFixed(5),r.toFixed(5));