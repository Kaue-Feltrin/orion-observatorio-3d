export function classifyRenderer(label=''){
 const value=String(label).trim();
 if(/swiftshader|llvmpipe|softpipe|software rasterizer|software renderer|basic render driver|\bwarp\b/i.test(value))return 'software';
 if(!value||/^(brave|webkit webgl|webgl|mozilla|angle)$/i.test(value))return 'unknown';
 return 'device-reported';
}
export function graphicsHelpFor({userAgent='',brave=false}={}){
 if(brave)return{browser:'Brave',settings:'brave://settings/system',gpu:'brave://gpu'};
 if(/Edg\//.test(userAgent))return{browser:'Edge',settings:'edge://settings/system',gpu:'edge://gpu'};
 if(/Firefox\//.test(userAgent))return{browser:'Firefox',settings:'about:preferences#general',gpu:'about:support'};
 if(/Chrome\//.test(userAgent))return{browser:'Chrome',settings:'chrome://settings/system',gpu:'chrome://gpu'};
 return{browser:'seu navegador',settings:null,gpu:null};
}
