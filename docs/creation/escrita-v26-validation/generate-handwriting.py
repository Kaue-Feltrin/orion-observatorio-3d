"""Offline handwriting outlines + medial strokes, derived from Caveat (OFL-1.1).
Input is the verified upstream TTF; no model or generated raster art. Runtime
uses the resulting bounded atlas only; this tool needs FontTools/Pillow/NumPy.
"""
from pathlib import Path
import json,sys,math,re,hashlib
import numpy as np
from PIL import Image,ImageFont,ImageDraw
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
src=Path(sys.argv[1]);dest=Path(sys.argv[2]);assert hashlib.sha256(src.read_bytes()).hexdigest()=='0bdb6b660482d31531b3945849fba5916b3ef8695da7024a9e6b9ee3c4157988', 'Upstream font differs from reviewed source';font=instantiateVariableFont(TTFont(src),{'wght':400},inplace=False)
static=Path('/tmp/orion-v26-caveat-static.ttf');font.save(static)
pil=ImageFont.truetype(str(static),160);cmap=font.getBestCmap();gs=font.getGlyphSet();scale=1000/font['head'].unitsPerEm

def thin(a):
 a=a.astype(np.uint8)
 for iteration in range(100):
  changed=False
  for phase in [0,1]:
   p=np.pad(a,1);ns=[p[:-2,1:-1],p[:-2,2:],p[1:-1,2:],p[2:,2:],p[2:,1:-1],p[2:,:-2],p[1:-1,:-2],p[:-2,:-2]]
   count=sum(ns);trans=sum((ns[i]==0)&(ns[(i+1)%8]==1) for i in range(8))
   cond=(ns[0]*ns[2]*ns[4]==0)&(ns[2]*ns[4]*ns[6]==0) if phase==0 else (ns[0]*ns[2]*ns[6]==0)&(ns[0]*ns[4]*ns[6]==0)
   remove=(a==1)&(count>=2)&(count<=6)&(trans==1)&cond
   if remove.any():a[remove]=0;changed=True
  if not changed:break
 return a

def simplify(points,tol=1.8):
 if len(points)<3:return points
 a,b=np.array(points[0]),np.array(points[-1]);delta=b-a;den=np.linalg.norm(delta)
 distances=[np.linalg.norm(np.array(p)-a) if not den else abs(delta[0]*(np.array(p)-a)[1]-delta[1]*(np.array(p)-a)[0])/den for p in points]
 i=int(np.argmax(distances))
 if distances[i]>tol:return simplify(points[:i+1],tol)[:-1]+simplify(points[i:],tol)
 return [points[0],points[-1]]

def strokes(char):
 bbox=pil.getbbox(char,anchor='ls');left,top,right,bottom=bbox
 if right<=left or bottom<=top:return []
 image=Image.new('L',(right-left+10,bottom-top+10));ImageDraw.Draw(image).text((5-left,5-top),char,font=pil,fill=255,anchor='ls')
 sk=thin(np.array(image)>80);nodes={(int(x),int(y)) for y,x in zip(*np.where(sk))};edges={}
 for x,y in nodes:
  neighbors=[]
  for dx,dy in [(1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)]:
   q=(x+dx,y+dy)
   if q in nodes and (not dx or not dy or ((x+dx,y) not in nodes and (x,y+dy) not in nodes)):neighbors.append(q)
  edges[(x,y)]=set(neighbors)
 paths=[]
 while any(edges.values()):
  ends=[p for p,n in edges.items() if len(n)==1];start=min(ends or [p for p,n in edges.items() if n],key=lambda p:(p[0],p[1]));path=[start];current=start
  while edges[current]:
   nxt=min(edges[current],key=lambda p:(p[0],p[1]));edges[current].remove(nxt);edges[nxt].remove(current);path.append(nxt);current=nxt
   if len(edges[current])>1:break
  if len(path)>1:
   points=[[(x-5+left+.5)*6.25,(y-5+top+.5)*6.25] for x,y in path];paths.append(simplify(points))
 # Choose the next stroke from the nearest available endpoint; each lift is kept.
 ordered=[];cursor=(0,0)
 while paths:
  idx,reverse=min(((i,r) for i in range(len(paths)) for r in [False,True]),key=lambda v:math.dist(cursor,paths[v[0]][-1 if v[1] else 0]))
  p=paths.pop(idx);p=p[::-1] if reverse else p;ordered.append([[round(x,1),round(y,1)] for x,y in p]);cursor=p[-1]
 return ordered
atlas={}
for code in sorted(set(range(32,127))|set(map(ord,'ÀÁÂÃÄÅàáâãäåÈÉÊËèéêëÌÍÎÏìíîïÒÓÔÕÖòóôõöÙÚÛÜùúûüÇçÑñÝýÿŸÆæŒœØøß'))):
 char=chr(code);name=cmap.get(code)
 if not name:continue
 pen=SVGPathPen(gs);gs[name].draw(TransformPen(pen,(scale,0,0,-scale,0,0)))
 atlas[char]={'advance':round(gs[name].width*scale,2),'outline':re.sub(r'(?<=\d)\.0(?=\D|$)','',pen.getCommands()),'strokes':strokes(char)}
dest.write_text('/*! @license Handwriting derived from Caveat, copyright 2014 The Caveat Project Authors. OFL-1.1; /licenses/Caveat-OFL.txt. */\nexport const HANDWRITING='+json.dumps(atlas,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(atlas),'glyphs;',dest.stat().st_size,'bytes')
