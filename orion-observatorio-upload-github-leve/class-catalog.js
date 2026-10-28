// Read-only presentation of the three classes in orion-fichas PR179.
// BASE: public/rules-core/index.mjs. Free skills: public/creator-guidance.js.
// These figures are class bases, not derived resources or character grants.
export const CLASS_CHOICES=Object.freeze([
 {code:'COMBATENTE',label:'Combatente',atlas:0,theme:'Confronto e proteção',
  summary:'Treinamento para enfrentar ameaças de forma direta.',
  strengths:['Mais Pontos de Vida na base.','Treinamento voltado a armas e confronto.'],
  limits:['Menos escolhas livres de perícias na base.','Menos Esforço e Sanidade na base.'],
  example:'Você era segurança e passou a treinar para enfrentar as ameaças que antes tentava conter.',
  base:{pv:20,pe:2,san:12,freeSkills:1}},
 {code:'ESPECIALISTA',label:'Especialista',atlas:1,theme:'Perícias e soluções',
  summary:'Versatilidade para investigar e resolver problemas com técnica.',
  strengths:['Mais perícias livres na base.','Versatilidade em tarefas especializadas.'],
  limits:['Base de Vida abaixo do Combatente.','Base de Esforço abaixo do Ocultista.'],
  example:'Você era técnico de manutenção e usava seu conhecimento para investigar casos estranhos.',
  base:{pv:16,pe:3,san:16,freeSkills:7}},
 {code:'OCULTISTA',label:'Ocultista',atlas:2,theme:'Rituais e paranormal',
  summary:'Estudo e uso do paranormal por meio de rituais.',
  strengths:['Mais Esforço e Sanidade na base.','Acesso a rituais pela classe.'],
  limits:['Menor base de Pontos de Vida.','Rituais exigem gerenciar custos e condições.'],
  example:'Você era pesquisador e começou a estudar rituais ao encontrar registros do Outro Lado.',
  base:{pv:12,pe:4,san:20,freeSkills:3}}
].map(c=>Object.freeze({...c,base:Object.freeze(c.base),strengths:Object.freeze(c.strengths),limits:Object.freeze(c.limits)})));
export function classByCode(code){return CLASS_CHOICES.find(c=>c.code===code)??null;}
export function wrapClassIndex(index){return ((index%CLASS_CHOICES.length)+CLASS_CHOICES.length)%CLASS_CHOICES.length;}
export function orbitalPose(index,rotation,radius){
 const angle=(index*120-rotation)*Math.PI/180,front=(Math.cos(angle)+1)/2;
 return {x:Math.sin(angle)*radius,y:-30*(1-front),scale:.62+.38*front,z:Math.round(front*100)};
}
export function nextClassDraft(draft,classCode){
 const selected=classByCode(classCode);
 if(!selected||!draft?.origin?.code||typeof draft.name!=='string'||!draft.name.trim())return null;
 return {...draft,step:'class',classCode:selected.code};
}
