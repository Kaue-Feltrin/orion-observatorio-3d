import{MANUAL_EQUIPMENT,reviewEquipment}from './creation-journey-core.js';
export const categoryLabel=n=>['0','I','II','III','IV'][n]??String(n);
export const patentLabel=code=>({RECRUTA:'Recruta',OPERADOR:'Operador',AGENTE_ESPECIAL:'Agente Especial',OFICIAL_OPERACOES:'Oficial de Operações',AGENTE_ELITE:'Agente de Elite'})[code]||code;
export function equipmentGuidance(ch){
 const review=reviewEquipment(ch),normalized=new Map(review.items.map(i=>[i.stableKey,i]));
 const rows=ch.inventory_json.map(row=>{const item=MANUAL_EQUIPMENT.find(i=>i.stableKey===row.stableKey)||{stableKey:row.stableKey,name:row.name,group:'GERAL'},verified=normalized.get(row.stableKey),category=verified?.category??item.category,limit=review.limits?.[category],used=review.counts[category],errors=[];
  if(category>0&&limit===0)errors.push(`Categoria ${categoryLabel(category)} não está disponível para ${patentLabel(review.patent)}. Retire este item ou confira a patente combinada para a campanha.`);
  else if(category>0&&used>limit)errors.push(`Categoria ${categoryLabel(category)}: ${used} de ${limit} unidades. Retire ${used-limit} unidade${used-limit===1?'':'s'} entre os itens dessa categoria.`);
  for(const issue of review.issues)if(!['equipment_category_limit','equipment_over_max_capacity'].includes(issue.code)&&(issue.message.includes(item.name)||!verified&&issue.code==='unknown_equipment'))errors.push(issue.message);
  if(review.usedSpaces>review.maxCarry&&verified)errors.push(`Carga acima do máximo em ${review.usedSpaces-review.maxCarry} espaço(s). Reduza a quantidade ou retire itens.`);
  return{row,item,category,errors:[...new Set(errors)],discounted:verified?.catalogCategory!==undefined&&verified.catalogCategory!==category};
 });
 return{review,rows,conflicts:rows.filter(r=>r.errors.length)};
}
// Preview only: the original reviewer owns categories, engineer/age adjustments
// and counts. Never rewrite the catalog or increase the selected patent.
export function additionGuidance(ch,item,current=reviewEquipment(ch)){
 if(item.group==='AMALDICOADO')return{fits:false,message:'Exige concessão específica.'};
 const inventory=ch.inventory_json.map(i=>({...i})),existing=inventory.find(i=>i.stableKey===item.stableKey);
 if(existing){if(existing.quantity>=20)return{fits:false,message:'Quantidade máxima selecionada.'};existing.quantity++;}
 else inventory.push({stableKey:item.stableKey,name:item.name,quantity:1,...(item.configurableSkill?{config:{skillCode:'CIENCIAS'}}:{})});
 const next=reviewEquipment({...ch,inventory_json:inventory}),entry=next.items.find(i=>i.stableKey===item.stableKey),cat=entry?.category??item.category;
 if(next.limits&&cat>0&&next.counts[cat]>next.limits[cat]&&next.counts[cat]>current.counts[cat])return{fits:false,category:cat,message:next.limits[cat]===0?`Categoria ${categoryLabel(cat)} indisponível para ${patentLabel(next.patent)}.`:`Limite da categoria ${categoryLabel(cat)} atingido (${next.limits[cat]} unidades).`};
 if(next.usedSpaces>next.maxCarry&&next.usedSpaces>current.usedSpaces)return{fits:false,category:cat,message:'Esta unidade ultrapassa a carga máxima.'};
 return{fits:true,category:cat,message:item.configurableSkill?'Escolha a perícia associada após adicionar.':''};
}
