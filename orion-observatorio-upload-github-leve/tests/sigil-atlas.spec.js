import{test,expect}from'@playwright/test';import{readFile}from'node:fs/promises';
test('sigilos mantêm o glifo correto em limites numéricos do atlas',async({page})=>{
const source=await readFile(new URL('../creation-sigils.js',import.meta.url),'utf8');const fragment=source.match(/const fragmentShader=`([\s\S]*?)`;/)[1].replace('#include <colorspace_fragment>','');
const samples=await page.evaluate(fragment=>{
 const canvas=document.createElement('canvas');canvas.width=canvas.height=16;const gl=canvas.getContext('webgl',{alpha:true,antialias:false});
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 const vertex='attribute vec2 p;uniform float testCell;varying vec2 vUv;varying float vDepth,vSeed,vCell;void main(){vUv=vec2(.5);vDepth=.5;vSeed=0.;vCell=testCell;gl_Position=vec4(p,0.,1.);}';
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision highp float;'+fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const at=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,2,gl.FLOAT,false,0,0);
 for(const [name,value]of Object.entries({uFront:1,uOpacity:1,uRelease:0,uCharge:0,uTime:0}))gl.uniform1f(gl.getUniformLocation(program,name),value);gl.uniform1i(gl.getUniformLocation(program,'uMap'),0);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);for(const [p,v]of[[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,p,v);
 const rows=[];
 for(let cell=0;cell<12;cell++)for(const epsilon of[-.000002,0,.000002]){const pixels=new Uint8Array(64*32*4),x=cell%8*8,y=(3-Math.floor(cell/8))*8;for(let j=y;j<y+8;j++)for(let i=x;i<x+8;i++)pixels[(j*64+i)*4]=255;gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,64,32,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);gl.uniform1f(gl.getUniformLocation(program,'testCell'),cell+epsilon);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);const pixel=new Uint8Array(4);gl.readPixels(8,8,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);rows.push({cell,epsilon,alpha:pixel[3],correct:pixel[3]>250});}
 gl.getExtension('WEBGL_lose_context')?.loseContext();return rows;
},fragment)
expect(samples).toHaveLength(36);expect(samples.filter(s=>!s.correct)).toEqual([]);
});
