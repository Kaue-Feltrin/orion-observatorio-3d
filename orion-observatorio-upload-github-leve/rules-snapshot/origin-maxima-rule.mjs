/** Órion Fichas v0.6.0 · PR92: máximos das origens Vítima / Universitário.
 * Livro Base Ordem Paranormal RPG 1.3 p.31; suplementos Órion convertem
 * progressão por NEX em progressão por NÍVEL (NEX real separado).
 *
 * Vítima: +1 SAN máxima por nível (N1=+1, N20=+20).
 * Universitário: +1 PE máximo no N1 e em cada nível ímpar (N1,N3,...),
 * total Math.ceil(level/2), mais +1 no limite de PE/turno SEM alterar DT.
 * Projeção, não operação de recurso: SAN/PE atuais permanecem inalterados.
 */
export const ORIGIN_MAXIMA_VERSION=1;
export const ORIGIN_MAXIMA_SOURCE='Ordem Paranormal RPG 1.3 p.31; Suplemento/Guia Órion: conversão NEX→Nível';
const originMaximaSources=Object.freeze({
 'Vítima':Object.freeze({sourceRef:'BASE-1.3-P31-VITIMA',name:'Cicatrizes Psicológicas'}),
 'Universitário':Object.freeze({sourceRef:'BASE-1.3-P31-UNIVERSITARIO',name:'Dedicação'})
});
const rejectOriginMaxima=reason=>Object.freeze({
 version:ORIGIN_MAXIMA_VERSION,status:'unavailable',valid:false,reason,
 origin:null,level:null,sanMaxBonus:0,peMaxBonus:0,pePerTurnBonus:0,
 sourceRef:null,resourceCurrentChanged:false,grant:false,dtChanged:false,
 nexUsed:false,canonical:false
});
export function previewOriginMaxima({origin,level}={}){
 const info=typeof origin==='string'?originMaximaSources[origin]:null;
 if(!info)return rejectOriginMaxima('origin_not_covered');
 if(typeof level!=='number'||!Number.isSafeInteger(level)||level<1||level>20)
  return rejectOriginMaxima('invalid_level');
 return Object.freeze({
  version:ORIGIN_MAXIMA_VERSION,status:'read-only-origin-projection',valid:true,
  origin,level,name:info.name,sourceRef:info.sourceRef,
  ruleSource:ORIGIN_MAXIMA_SOURCE,
  sanMaxBonus:origin==='Vítima'?level:0,
  peMaxBonus:origin==='Universitário'?Math.ceil(level/2):0,
  pePerTurnBonus:origin==='Universitário'?1:0,
  resourceCurrentChanged:false,grant:false,dtChanged:false,
  nexUsed:false,canonical:false
 });
}
