// Projeto Órion · v0.9.2: diffraction spikes fotográficos leves.
// Canvas é rasterizado uma única vez, o giro posterior acontece na GPU.
// Não altera a textura astronômica nem usa postprocessing extra.
import * as THREE from 'three';

function diffractionTexture() {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=512;
  const context=canvas.getContext('2d');
  if(!context)throw Error('Canvas 2D indisponível para o flare da estrela');
  const mid=256;
  context.translate(mid,mid);
  context.globalCompositeOperation='lighter';
  // Núcleo de difração difuso; as pontas são linhas de luz, não polígonos sólidos.
  const core=context.createRadialGradient(0,0,2,0,0,90);
  core.addColorStop(0,'rgba(255,249,226,.30)');
  core.addColorStop(.11,'rgba(247,223,185,.18)');
  core.addColorStop(.36,'rgba(199,179,223,.043)');
  core.addColorStop(1,'rgba(199,179,223,0)');
  context.fillStyle=core;context.fillRect(-96,-96,192,192);

  function ray(angle,length,intensity,thickness){
    context.save();context.rotate(angle);
    // Uma cauda larga quase invisível, sobreposta a um filete muito fino.
    for(const [wide,energy] of [[thickness*3.4,.10],[thickness,.48],[.55,1]]){
      const gradient=context.createLinearGradient(0,0,length,0);
      const multiplier=intensity*energy;
      gradient.addColorStop(0,`rgba(255,252,239,${Math.min(1,multiplier)})`);
      gradient.addColorStop(.08,`rgba(255,242,211,${multiplier*.75})`);
      gradient.addColorStop(.34,`rgba(228,217,246,${multiplier*.32})`);
      gradient.addColorStop(.70,`rgba(205,202,255,${multiplier*.12})`);
      gradient.addColorStop(1,'rgba(205,202,255,0)');
      context.fillStyle=gradient;
      context.beginPath();
      context.moveTo(0,-wide);
      context.lineTo(length,0);
      context.lineTo(0,wide);
      context.closePath();
      context.fill();
    }
    context.restore();
  }
  // Reflexos de abertura: 4 pontas dominantes, quatro secundárias delicadas.
  for(let i=0;i<4;i++)ray(i*Math.PI/2,231,.48,1.6);
  for(let i=0;i<4;i++)ray(Math.PI/4+i*Math.PI/2,119,.15,.72);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.magFilter=THREE.LinearFilter;
  texture.generateMipmaps=true;
  return texture;
}

export function createCinematicStarSpikes(group,{reducedMotion=false}={}){
  const texture=diffractionTexture();
  function sprite(size,opacity,order){
    const material=new THREE.SpriteMaterial({
      map:texture,transparent:true,opacity,depthTest:false,depthWrite:false,
      blending:THREE.AdditiveBlending,toneMapped:false
    });
    const result=new THREE.Sprite(material);
    result.scale.setScalar(size);result.renderOrder=order;
    group.add(result);
    return result;
  }
  const primary=sprite(174,.31,11);
  const secondary=sprite(123,.085,11);
  function update(time,hover,travelling){
    const pulse=reducedMotion?0:Math.sin(time*.79+.9);
    const irregular=reducedMotion?0:Math.sin(time*2.11+.7)*.55+Math.sin(time*3.16+2.3)*.45;
    primary.material.rotation=reducedMotion?.11:.11+time*.019;
    secondary.material.rotation=reducedMotion?-.30:-.30-time*.012;
    primary.material.opacity=(travelling?.12:.28)+.040*pulse+.032*irregular+(hover?.09:0);
    secondary.material.opacity=(travelling?.045:.075)+.012*pulse+(hover?.035:0);
    primary.scale.setScalar(174*(1+.018*pulse+(hover?.045:0)));
    secondary.scale.setScalar(123*(1+.025*irregular));
  }
  function dispose(){
    primary.material.dispose();secondary.material.dispose();texture.dispose();
  }
  return {primary,secondary,update,dispose};
}
