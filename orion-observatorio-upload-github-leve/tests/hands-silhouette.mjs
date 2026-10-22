import * as THREE from 'three';

// Amostra o alpha da arte e do acabamento na malha deformada. As bordas
// transparentes do retângulo do PNG não representam a entrada do braço.
export function entry(mesh,camera,{data,info}){
  mesh.updateWorldMatrix(true,false);
  const geometry=mesh.geometry,uv=geometry.attributes.uv,color=geometry.attributes.color;
  const cols=geometry.parameters.widthSegments,rows=geometry.parameters.heightSegments;
  const points=Array.from({length:uv.count},(_,i)=>mesh.getVertexPosition(i,new THREE.Vector3())
    .applyMatrix4(mesh.matrixWorld).project(camera));
  const levels=Array.from({length:rows+1},(_,row)=>uv.getY(row*(cols+1)));
  const point=new THREE.Vector3();
  let top=1,bottom=0,count=0,silhouetteLeft=Infinity,silhouetteRight=-Infinity;
  for(let y=0;y<info.height;y+=3){
    const v=1-y/(info.height-1);
    let row=0;
    while(row<rows-1&&v<levels[row+1])row++;
    const fy=(levels[row]-v)/(levels[row]-levels[row+1]);
    for(let x=0;x<info.width;x+=3){
      const alpha=data[(y*info.width+x)*4+3];
      if(alpha<96)continue;
      const u=x/(info.width-1),col=Math.min(cols-1,Math.floor(u*cols)),fx=u*cols-col;
      const a=row*(cols+1)+col,b=(row+1)*(cols+1)+col,c=b+1,d=a+1;
      // PlaneGeometry divide cada célula na diagonal b–d.
      const ids=fx+fy<=1?[a,d,b]:[c,d,b];
      const weights=fx+fy<=1?[1-fx-fy,fx,fy]:[fx+fy-1,1-fy,1-fx];
      if(color&&alpha*ids.reduce((sum,id,i)=>sum+color.getW(id)*weights[i],0)<96)continue;
      point.set(0,0,0);
      for(let i=0;i<3;i++)point.addScaledVector(points[ids[i]],weights[i]);
      const sx=(point.x+1)/2,sy=(1-point.y)/2;
      if(sy>=0&&sy<=1){silhouetteLeft=Math.min(silhouetteLeft,sx);silhouetteRight=Math.max(silhouetteRight,sx);}
      const sideBand=(sx>=0&&sx<.004)||(sx<=1&&sx>.996);
      if(sideBand&&sy>=0&&sy<=1){top=Math.min(top,sy);bottom=Math.max(bottom,sy);count++;}
    }
  }
  return {top,bottom,center:(top+bottom)/2,count,silhouetteLeft,silhouetteRight};
}
