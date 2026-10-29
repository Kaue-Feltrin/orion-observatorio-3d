/** Júnior (Prodígio) · catálogo fechado de uma modificação sem elevar categoria.
 * Fontes: Suplemento Órion 1.9.3.1 p.15; OPRPG v1.3 pp.60-64.
 * Armas especiais da guilda, munições e opções configuráveis permanecem bloqueadas.
 */
export const JUNIOR_MOD_SOURCE='Suplemento Órion 1.9.3.1 p.15 + Ordem Paranormal RPG 1.3 pp.60-64';
export const JUNIOR_MOD_OPTIONS=Object.freeze({
 'EQ-PROT-BASE-LEVE':Object.freeze(['REFORCADA','DISCRETA']),
 'EQ-PROT-BASE-PESADA':Object.freeze(['REFORCADA','ANTIBOMBAS','BLINDADA']),
 'EQ-GER-BASE-UTENSILIO':Object.freeze(['DISCRETO']),
 'EQ-GER-BASE-VESTIMENTA':Object.freeze(['DISCRETO']),
 // Itens inequívocos do Livro Base; nunca liberar por grupo ARMA genericamente.
 'EQ-ARMA-BASE-FACA':Object.freeze(['CERTEIRA','CRUEL','DISCRETA','PERIGOSA','TATICA']),
 'EQ-ARMA-BASE-PUNHAL':Object.freeze(['CERTEIRA','CRUEL','DISCRETA','PERIGOSA','TATICA']),
 'EQ-ARMA-BASE-ESPADA':Object.freeze(['CERTEIRA','CRUEL','DISCRETA','PERIGOSA','TATICA']),
 'EQ-ARMA-BASE-KATANA':Object.freeze(['CERTEIRA','CRUEL','DISCRETA','PERIGOSA','TATICA']),
 'EQ-ARMA-BASE-MACHADO':Object.freeze(['CERTEIRA','CRUEL','DISCRETA','PERIGOSA','TATICA']),
 'EQ-ARMA-BASE-ARCO':Object.freeze(['CERTEIRA','CRUEL','DISCRETA','PERIGOSA','TATICA']),
 'EQ-ARMA-BASE-BALESTRA':Object.freeze(['CERTEIRA','CRUEL','DISCRETA','PERIGOSA','TATICA']),
 // Armas de fogo explícitas: configurações de munição e automação não curadas.
 'EQ-ARMA-BASE-PISTOLA':Object.freeze(['DISCRETA','MIRA_LASER','TATICA']),
 'EQ-ARMA-BASE-REVOLVER':Object.freeze(['DISCRETA','MIRA_LASER','TATICA']),
 'EQ-ARMA-BASE-ESPINGARDA':Object.freeze(['DISCRETA','MIRA_LASER','TATICA']),
 'EQ-ARMA-BASE-FUZIL-DE-CACA':Object.freeze(['DISCRETA','MIRA_LASER','TATICA']),
 'EQ-ARMA-BASE-FUZIL-DE-PRECISAO':Object.freeze(['DISCRETA','MIRA_LASER','TATICA'])
});
export const JUNIOR_MOD_LABELS=Object.freeze({
 REFORCADA:'Reforçada · +2 Defesa, +1 espaço',
 DISCRETA:'Discreta · -1 espaço, +5 em Crime para ocultar',
 ANTIBOMBAS:'Antibombas · +5 resistência contra efeitos de área',
 BLINDADA:'Blindada · RD 5, +1 espaço',
 DISCRETO:'Discreto · -1 espaço, +5 em Crime para ocultar',
 CERTEIRA:'Certeira · +2 em testes de ataque',
 CRUEL:'Cruel · +2 nas rolagens de dano',
 PERIGOSA:'Perigosa · +2 na margem de ameaça',
 TATICA:'Tática · sacar como ação livre',
 MIRA_LASER:'Mira Laser · +2 na margem de ameaça'
});
const DETAILS={
 REFORCADA:{spacesDelta:1,defenseBonus:2},
 DISCRETA:{spacesDelta:-1,concealmentBonus:5},
 ANTIBOMBAS:{areaResistanceBonus:5},
 BLINDADA:{spacesDelta:1,damageReduction:5},
 DISCRETO:{spacesDelta:-1,concealmentBonus:5},
 CERTEIRA:{attackBonus:2},CRUEL:{damageBonus:2},
 PERIGOSA:{threatRangeBonus:2},TATICA:{drawAction:'free'},
 MIRA_LASER:{threatRangeBonus:2}
};
/** Uma modificação em um exemplar, sem conceder nada ao estado da ficha. */
export function reviewJuniorModification(item,raw,quantity){
 const codes=JUNIOR_MOD_OPTIONS[item?.stableKey];
 const modifications=raw?.config?.modifications;
 if(!codes||!Array.isArray(modifications)||modifications.length!==1||
    !codes.includes(modifications[0])||quantity!==1||
    raw.config.curses?.length||
    (!item.configurableSkill&&Object.hasOwn(raw.config,'skillCode'))||
    Object.keys(raw.config).some(k=>!['modifications','skillCode'].includes(k)))return null;
 const code=modifications[0],effect=DETAILS[code];
 const spaces=Math.max(0,item.spaces+(effect.spacesDelta||0));
 return {code,stableKey:item.stableKey,name:item.name,source:JUNIOR_MOD_SOURCE,
  category:item.category,categoryIncrease:0,spaces,baseSpaces:item.spaces,
  effects:{...effect},freeModification:true,certifiedSubset:true,
  appliedToCharacter:false};
}
