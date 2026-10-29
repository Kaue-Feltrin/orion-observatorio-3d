// The same pixel budget applies to the observatory and the birth scene.
export function boundedPixelRatio(profile,native,width,height){
 return Math.min(Math.max(.5,native||1),profile.dpr,Math.sqrt(profile.maxPixels/Math.max(1,width*height)));
}

export function createFrameMonitor({interval=2400,minSamples=12}={}){
 let since=null,total=0,count=0,slowWindows=0;
 const state={averageMs:null,samples:0,updatedAt:null,windowMs:0};
 function reset(now=null){
  since=now;total=0;count=0;slowWindows=0;
  state.averageMs=null;state.samples=0;state.updatedAt=null;state.windowMs=0;
 }
 function record(now,ms){
  if(!Number.isFinite(ms)||ms<=0||ms>1000){reset(now);return false;}
  if(since===null)since=now;
  total+=ms;count++;
  if(now-since<interval||count<minSamples)return false;
  const average=total/count;state.averageMs=average;state.samples=count;
  state.updatedAt=now;state.windowMs=now-since;
  since=now;total=0;count=0;
  slowWindows=average>24?slowWindows+1:0;
  const reduce=average>38||slowWindows>=2;
  if(reduce)slowWindows=0;
  return reduce;
 }
 return{state,record,reset};
}
