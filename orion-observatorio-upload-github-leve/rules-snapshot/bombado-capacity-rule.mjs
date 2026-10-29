/** Órion Fichas · PR90 · Bombado / AESTHETIC!
 * Referência: Manual Consolidado Órion v0.15, OR-ADD-005;
 * Suplemento Órion 1.9.3.1, p.9.
 * +VIG espaços de capacidade, sem alteração de FOR, perícias ou Defesa.
 * A alternativa VIG por FOR em testes de Luta/Atletismo é condicional,
 * não um bônus permanente de perícia e não é executada aqui.
 */
export const BOMBADO_CAPACITY_SOURCE_REF='OR-ADD-005';
export const BOMBADO_CAPACITY_SOURCE='Suplemento Órion 1.9.3.1, p.9';
export const BOMBADO_CAPACITY_VERSION=1;
const normalizeBombadoOrigin=x=>typeof x==='string'?x.normalize('NFD')
 .replace(/[\u0300-\u036f]/g,'').trim().toUpperCase():'';
const validBombadoAttribute=x=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=0&&x<=9;
function unavailableBombadoCapacity(reason){
 return Object.freeze({
  version:BOMBADO_CAPACITY_VERSION,sourceRef:BOMBADO_CAPACITY_SOURCE_REF,
  ruleSource:BOMBADO_CAPACITY_SOURCE,status:'unavailable',valid:false,reason,
  baseCapacity:null,originBonus:null,combinedCapacity:null,
  strengthChanged:false,skillBonus:0,defenseBonus:0,grant:false,
  bonusAppliedToCharacter:false,projectionOnly:true
 });
}
export function previewBombadoCapacity({origin,strength,vigor}={}){
 if(normalizeBombadoOrigin(origin)!=='BOMBADO')return unavailableBombadoCapacity('origin_not_bombado');
 if(!validBombadoAttribute(strength))return unavailableBombadoCapacity('invalid_strength');
 if(!validBombadoAttribute(vigor))return unavailableBombadoCapacity('invalid_vigor');
 const baseCapacity=strength===0?2:strength*5,originBonus=vigor;
 return Object.freeze({
  version:BOMBADO_CAPACITY_VERSION,sourceRef:BOMBADO_CAPACITY_SOURCE_REF,
  ruleSource:BOMBADO_CAPACITY_SOURCE,status:'read-only-origin-capacity',
  valid:true,baseCapacity,originBonus,combinedCapacity:baseCapacity+originBonus,
  strengthChanged:false,skillBonus:0,defenseBonus:0,grant:false,
  bonusAppliedToCharacter:false,projectionOnly:true,
  substitutionNote:'VIG pode substituir FOR em testes de Luta ou Atletismo; não modifica atributos nem treinamento.'
 });
}
