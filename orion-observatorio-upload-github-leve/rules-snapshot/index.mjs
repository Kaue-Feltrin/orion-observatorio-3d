import {previewTankBlock} from './tank-block-rule.mjs';
import {previewBombadoCapacity} from './bombado-capacity-rule.mjs';
import {previewSwimmerOrigin} from './swimmer-origin-rule.mjs';
import {previewOriginMaxima} from './origin-maxima-rule.mjs';
import {conflictingSkillIdentities} from './legacy-collection-identity-pr137.mjs';
import {CREATION_SKILLS} from './creation-catalog.mjs';
/**
 * Órion Fichas / rules-core — núcleo determinístico e SEM I/O.
 * Portado de projeto-orion/worker/rules/{progression,characterCreation}.ts (out/2026).
 * Prévia não canônica: bônus iniciais selecionados de Trilha, sem integração de itens e regras excepcionais.
 * Deve ser executado tanto no navegador quanto no Worker; nunca grava escolhas.
 */
export const RULE_PACK = Object.freeze({
  id: 'orion-baseline-2026-10-15',
  status: 'partial-preview',
  sources: {
    class: 'Projeto Órion / CL-COM-001 · CL-ESP-001 · CL-OCU-001',
    level: 'Projeto Órion / ADM-001 · PR-006; NEX & Experiência',
    age: 'Projeto Órion / Diferentes Estágios da Vida',
    defense: 'Base 10 + AGI; equipamento e modificadores condicionais não são aplicados automaticamente',
    effects: 'Trilhas: Manual Órion v0.11; origens, perícias e poderes: Manual Órion v0.15 (somente fontes verificadas)'
  }
});


/** Engineer nonweapon item TYPES reviewed in Manual v0.15 / Livro Base 1.3
 * pp.65–66. The catalog's GERAL group alone is NOT proof of a nonweapon.
 * Guia Órion p.4: benefit concerns all copies of one item type.
 * This classification is ONLY for read-only projection, not acquisition.
 */
export const VERIFIED_ENGINEER_NONWEAPON_TYPES=Object.freeze([
 {stableKey:'EQ-GER-BASE-BLOQUEADOR-SINAL',source:'Livro Base 1.3 p.65; item operacional'},
 {stableKey:'EQ-GER-BASE-LANTERNA-TATICA',source:'Livro Base 1.3 p.65; item operacional'},
 {stableKey:'EQ-GER-BASE-OCULOS-VISAO-TERMICA',source:'Livro Base 1.3 p.66; item operacional'},
 {stableKey:'EQ-GER-BASE-TRAJE-HAZMAT',source:'Livro Base 1.3 p.66; item operacional'},
 {stableKey:'EQ-GER-BASE-BANDOLEIRA',source:'Livro Base 1.3 p.63,65; item operacional'},
 {stableKey:'EQ-GER-BASE-CICATRIZANTE',source:'Livro Base 1.3 p.63,65; item operacional consumível'},
 {stableKey:'EQ-GER-BASE-MOCHILA-MILITAR',source:'Livro Base 1.3 p.63,66; item operacional de capacidade'},
 {stableKey:'EQ-GER-SAH-DOCUMENTOS-FALSOS',source:'Sobrevivendo ao Horror 1.3.1 p.39-40; acessório de identidade'},
 {stableKey:'EQ-GER-SAH-EQUIP-ESCUTA',source:'Sobrevivendo ao Horror 1.3.1 p.40,42; item operacional'},
 {stableKey:'EQ-GER-SAH-OCULOS-VISAO-NOTURNA',source:'Sobrevivendo ao Horror 1.3.1 p.40,43; item operacional'}
].map(x=>Object.freeze(x)));

export const ATTRIBUTE_CODES = Object.freeze(['AGI','FOR','INT','PRE','VIG']);
export const CLASSES = Object.freeze(['COMBATENTE','ESPECIALISTA','OCULTISTA']);
export const EM_LEVEL_THRESHOLDS = Object.freeze({
  1:0,2:2,3:5,4:8,5:11,6:14,7:18,8:23,9:28,10:34,
  11:41,12:48,13:54,14:61,15:67,16:71,17:76,18:81,19:86,20:91
});
const POWER_LEVELS = new Set([3,6,9,12,15,18]);
const ATTRIBUTE_LEVELS = new Set([4,10,16,19]);
const TRAINING_LEVELS = new Set([7,14]);
const TRACK_LEVELS = new Set([2,8,13,20]);

export function lifeStageForAge(age) {
  if (!Number.isSafeInteger(age)||age<16||age>2147483647) return null;
  if (age<=17) return 'PRODIGIO';
  if (age<=24) return 'JOVEM';
  if (age<=44) return 'ADULTO';
  if (age<=64) return 'MADURO';
  return 'IDOSO';
}

export function levelForEm(em) {
  if (!Number.isInteger(em)||em<0) throw new RangeError('EM precisa ser inteiro não negativo.');
  let level=1;
  for (let n=2;n<=20;n++) if(em>=EM_LEVEL_THRESHOLDS[n])level=n;
  return level;
}
export function nextLevelEm(level) {
  if(!Number.isInteger(level)||level<1||level>20)throw new RangeError('Nível inválido.');
  return level===20?null:EM_LEVEL_THRESHOLDS[level+1];
}
export function occultistCircleAtLevel(level) {
  if(!Number.isInteger(level)||level<1||level>20)throw new RangeError('Nível inválido.');
  return level>=17?4:level>=11?3:level>=5?2:1;
}
export function classLevelMilestone(classCode,level){
  if(!CLASSES.includes(classCode))throw new RangeError('Classe inválida.');
  if(!Number.isInteger(level)||level<1||level>20)throw new RangeError('Nível inválido.');
  const choices=[];const automatic=[];
  if(level===2)choices.push('TRACK');
  if(POWER_LEVELS.has(level))choices.push('POWER');
  if(ATTRIBUTE_LEVELS.has(level))choices.push('ATTRIBUTE');
  if(TRAINING_LEVELS.has(level))choices.push('TRAINING');
  if(level===10)choices.push('VERSATILITY');
  if(classCode==='OCULTISTA'&&level>=2)choices.push('RITUAL');
  if(TRACK_LEVELS.has(level)&&level!==2)automatic.push('Nova Habilidade de Trilha');
  return {level,emRequired:EM_LEVEL_THRESHOLDS[level],choices,automatic};
}

/** Return a creation warning; never silently rewrite user attributes. */
export function checkCreationAttributes(attributes) {
  const issues=[];
  if(!attributes||typeof attributes!=='object'||Array.isArray(attributes))return ['Atributos ausentes.'];
  const values=ATTRIBUTE_CODES.map(k=>attributes[k]);
  if(values.some(v=>!Number.isInteger(v)||v<0||v>3))issues.push('Na criação, cada atributo precisa estar entre 0 e 3.');
  if(values.every(Number.isInteger)&&values.reduce((a,b)=>a+b,0)!==9)issues.push('Na criação, a soma dos cinco atributos deve ser 9.');
  if(values.filter(v=>v===0).length>2)issues.push('Na criação, são permitidos até dois atributos zerados.');
  return issues;
}

const BASE = Object.freeze({
  COMBATENTE:{pv:20,pe:2,san:12,pvLevel:4,peLevel:2,sanLevel:3},
  ESPECIALISTA:{pv:16,pe:3,san:16,pvLevel:3,peLevel:3,sanLevel:4},
  OCULTISTA:{pv:12,pe:4,san:20,pvLevel:2,peLevel:4,sanLevel:5}
});
function part(label,value,source,kind='base'){
  return {label,value,kind,source,rulePack:RULE_PACK.id};
}
function measure(parts,limitations=[]){return {value:parts.reduce((sum,p)=>sum+p.value,0),parts,limitations};}
function asAttributes(raw) {
  const a=typeof raw==='string'?JSON.parse(raw):raw;
  if(!a||typeof a!=='object'||Array.isArray(a))throw new TypeError('Atributos inválidos.');
  const parsed={};
  for(const k of ATTRIBUTE_CODES){if(!Number.isInteger(a[k])||a[k]<0||a[k]>9)throw new RangeError('Atributo inválido: '+k);parsed[k]=a[k];}
  return parsed;
}

/**
 * v0.4.4: catálogo estritamente permissivo para bônus de habilidades CANÔNICAS.
 * Não concede poderes, não reinterpreta fontes livres e não cria efeitos sem
 * referência textual inequívoca no Manual consolidado Órion v0.11.
 * `conditional` é exibido à parte: nunca somar à Defesa, perícia ou PV geral.
 */
export const VERIFIED_TRACK_EFFECTS=Object.freeze([
  Object.freeze({id:'casca-grossa-pv',classCode:'COMBATENTE',trackCode:'COM_TRO',abilityCode:'TR-COM-TRO-02',label:'Casca Grossa · PV por Nível',target:'pv',formula:'level',source:'Manual Órion v0.11 · TR-COM-TRO-02'}),
  Object.freeze({id:'casca-grossa-bloqueio',classCode:'COMBATENTE',trackCode:'COM_TRO',abilityCode:'TR-COM-TRO-02',label:'Casca Grossa · Vigor no Bloqueio',target:'conditional',formula:'vigor',context:'Somente ao Bloquear: somar VIG à RD do Bloqueio; não adiciona Defesa.',source:'Manual Órion v0.11 · TR-COM-TRO-02'}),
  Object.freeze({id:'flagelador-pv',classCode:'OCULTISTA',trackCode:'OCU_FLA',abilityCode:'TR-OCU-FLA-02',label:'Poder do Flagelo · PV por Nível',target:'pv',formula:'level',source:'Manual Órion v0.11 · TR-OCU-FLA-02'}),
  Object.freeze({id:'operacoes-iniciativa',classCode:'COMBATENTE',trackCode:'COM_OPE',abilityCode:'TR-COM-OPE-02',label:'Iniciativa Aprimorada',target:'skill',skill:'Iniciativa',formula:'fixed',amount:5,source:'Manual Órion v0.11 · TR-COM-OPE-02'}),
  Object.freeze({id:'estrategista-tatica',classCode:'ESPECIALISTA',trackCode:'ESP_EST',abilityCode:'TR-ESP-EST-02',label:'Roque Repentino',target:'skill',skill:'Tática',formula:'fixed',amount:2,source:'Manual Órion v0.11 · TR-ESP-EST-02'}),
  Object.freeze({id:'guerreiro-margem',classCode:'COMBATENTE',trackCode:'COM_GUE',abilityCode:'TR-COM-GUE-02',label:'Técnica Letal · Margem de Ameaça',target:'conditional',formula:'fixed',amount:2,context:'Somente ataques corpo a corpo: +2 na margem de ameaça; não soma no acerto.',source:'Manual Órion v0.11 · TR-COM-GUE-02'}),
  Object.freeze({id:'intuitivo-resistencia',classCode:'OCULTISTA',trackCode:'OCU_INT',abilityCode:'TR-OCU-INT-02',label:'Mente Sã · Resistência',target:'conditional',formula:'fixed',amount:5,context:'Somente testes de resistência contra efeitos paranormais.',source:'Manual Órion v0.11 · TR-OCU-INT-02'}),
  Object.freeze({id:'analitico-defesa',classCode:'COMBATENTE',trackCode:'COM_ANA',abilityCode:'TR-COM-ANA-02',label:'Identificar Fraqueza · Defesa',target:'conditional',formula:'fixed',amount:2,context:'Somente contra o ser analisado, após usar a habilidade e pagar seu custo; não altera a Defesa geral.',source:'Manual Órion v0.11 · TR-COM-ANA-02'})
]);

/* v0.4.5: projeção fechada de origens e poderes, conferida no Manual Órion v0.15.
 * Origens são DECLARADAS pelo jogador; nunca são concessões canônicas.
 * Só poderes N3 registrados pelo servidor com código e fonte exatos dão bônus.
 */
export const VERIFIED_ORIGINS=Object.freeze([
 {name:'Engenheiro',source:'Ordem Paranormal RPG 1.3 · PDF p.28; Guia Projeto Órion p.4',skills:['Profissão','Tecnologia']},
 {name:'Mergulhador',source:'Sobrevivendo ao Horror 1.3.1 · PDF p.13',skills:['Atletismo','Fortitude'],maximum:[{id:'origem-mergulhador-pv',label:'Fôlego de Nadador · PV máximos',target:'pv',formula:'fixed',amount:5}],conditional:[{id:'origem-mergulhador-folego',label:'Fôlego de Nadador · fôlego',formula:'vigor-double',requirement:'Pode prender a respiração por 2×VIG rodadas. Ao passar em teste de Atletismo para natação, avança deslocamento normal em vez de metade. Não soma bônus de perícia nem modifica recursos atuais.'}]},
 {name:'Universitário',source:'Ordem Paranormal RPG 1.3 · PDF p.31; SaH 1.3.1 p.98',skills:['Atualidades','Investigação'],maximum:[{id:'origem-universitario-pe',label:'Dedicação · PE máximos',target:'pe',formula:'odd-level-pe'},{id:'origem-universitario-limite-pe',label:'Dedicação · limite de PE por turno',target:'pePerTurn',formula:'fixed',amount:1}],conditional:[{id:'origem-universitario-dedicacao',label:'Dedicação · regra de conversão',amount:0,requirement:'O ganho de PE ocorre no N1 e novamente nos Níveis ímpares 3, 5, 7…; não depende do NEX real. O limite de PE/turno aumenta +1 sem alterar a DT dos efeitos.'}]},
 {name:'Vítima',source:'Ordem Paranormal RPG 1.3 · PDF p.31; SaH 1.3.1 p.98',skills:['Reflexos','Vontade'],maximum:[{id:'origem-vitima-san',label:'Cicatrizes Psicológicas · SAN máxima',target:'san',formula:'level'}]},
 {name:'Investigador',source:'Ordem Paranormal RPG 1.3 · PDF p.29',skills:['Investigação','Percepção'],conditional:[{id:'origem-investigador-faro-para-pistas',label:'Faro para Pistas',amount:5,costPe:1,requirement:'Uma vez por cena, ao fazer teste para procurar pistas, pode gastar 1 PE para receber +5 somente naquele teste. Não adiciona +5 permanente à Investigação.'}]},
 {name:'Servidor Público',source:'Ordem Paranormal RPG 1.3 · PDF p.30',skills:['Intuição','Vontade'],conditional:[{id:'origem-servidor-publico-espirito-civico',label:'Espírito Cívico',amount:2,costPe:1,requirement:'Somente quando faz teste para ajudar alguém, pode gastar 1 PE para aumentar em +2 o bônus concedido pela ajuda. Não adiciona +2 à perícia nem à Defesa.'}]},
 {name:'Trabalhador Rural',source:'Ordem Paranormal RPG 1.3 · PDF p.31',skills:['Adestramento','Sobrevivência'],conditional:[{id:'origem-trabalhador-rural-desbravador',label:'Desbravador',amount:5,costPe:2,requirement:'Quando faz teste de Adestramento ou Sobrevivência, pode gastar 2 PE para +5 naquele teste. Também ignora penalidade de deslocamento por terreno difícil; não é bônus permanente de perícia.'}]},
 {name:'Teórico da Conspiração',source:'Ordem Paranormal RPG 1.3 · PDF p.31',skills:['Investigação','Ocultismo'],conditional:[{id:'origem-teorico-eu-ja-sabia',label:'Eu Já Sabia',formula:'int',requirement:'Resistência permanente a dano mental igual ao Intelecto atual (RD mental); não é bônus na Defesa, em Vontade ou no máximo de SAN. Somente dano mental, não todo gasto de Sanidade.'}]},
 {name:'Acadêmico',source:'Ordem Paranormal RPG 1.3 · PDF p.26',skills:['Ciências','Investigação'],conditional:[{id:'origem-academico-saber-e-poder',label:'Saber é Poder',amount:5,costPe:2,requirement:'Somente ao fazer teste usando Intelecto: pode gastar 2 PE para receber +5 naquele teste. Não soma a todas as perícias com INT sem declaração de uso.'}]},
 {name:'Agente de Saúde',source:'Ordem Paranormal RPG 1.3 · PDF p.26',skills:['Intuição','Medicina'],conditional:[{id:'origem-agente-saude-tecnica-medicinal',label:'Técnica Medicinal',formula:'int',requirement:'Somente quando curar PV de um personagem: adiciona seu valor de INT ao total de PV curados. Não aumenta o máximo de PV nem a perícia Medicina.'}]},
 {name:'Artista',source:'Ordem Paranormal RPG 1.3 · PDF p.27',skills:['Artes','Enganação'],conditional:[{id:'origem-artista-magnum-opus',label:'Magnum Opus',amount:5,requirement:'Uma vez por missão, determine uma pessoa que o reconheça em cena de interação: +5 nos testes de PRE ou perícias baseadas em PRE contra ela. Outras situações somente a critério do mestre; não é bônus global.'}]},
 {name:'Atleta',source:'Ordem Paranormal RPG 1.3 · PDF p.27',skills:['Acrobacia','Atletismo'],conditional:[{id:'origem-atleta-110',label:'110%',amount:5,costPe:2,requirement:'Somente testes de perícia usando FOR ou AGI, exceto Luta e Pontaria: pode gastar 2 PE para receber +5 naquele teste. Não se aplica a testes de atributo puros.'}]},
 {name:'Acalentador',source:'OR-ADD-001',skills:['Diplomacia','Intuição']},
 {name:'Atirador Exímio',source:'OR-ADD-004',skills:['Percepção','Pontaria'],conditional:[{id:'origem-atirador-dano',label:'Precisão Mortal',formula:'training',skill:'Pontaria',requirement:'Somente armas de disparo ou arremesso, nunca armas de fogo; Ataque Especial utiliza metade do bônus.'}]},
 {name:'Bombado',source:'OR-ADD-005',skills:['Atletismo','Fortitude'],conditional:[{id:'origem-bombado-carga',label:'AESTHETIC! · capacidade',formula:'vigor',requirement:'+VIG espaços; pode usar VIG em vez de FOR em Luta e Atletismo, não é bônus fixo na perícia.'}]},
 {name:'Boticário',source:'OR-ADD-006',skills:['Ciências','Medicina'],conditional:[{id:'origem-boticario-ciencias',label:'Medicina Amarga',amount:5,requirement:'Ciências somente para identificar insumos, ervas e substâncias nocivas.'}]},
 {name:'Linha de Frente',source:'OR-ADD-012',skills:['Fortitude','Luta'],conditional:[{id:'origem-tanque-bloqueio',label:'O Tanque · Bloqueio',formula:'training-double',skill:'Fortitude',requirement:'+2 por grau de Fortitude somente no valor do Bloqueio. Nunca em Defesa ou na perícia.'}]},
 {name:'Mochileiro',source:'OR-ADD-013',skills:['Diplomacia','Sobrevivência'],conditional:[{id:'origem-mochileiro-espacos',label:'Bom Mochileiro',amount:5,requirement:'+5 espaços com a mochila exclusiva, não acumula com mochila militar.'}]},
 {name:'Player',source:'OR-ADD-014',skills:['Reflexos','Tecnologia']},
 {name:'Profeta',source:'OR-ADD-015',skills:['Intuição','Religião']},
 {name:'Veterinário',source:'OR-ADD-017',skills:['Adestramento','Medicina'],conditional:[{id:'origem-veterinario-medicina',label:'Animalis',amount:5,requirement:'Medicina apenas em animais.'}]},
 {name:'Exorcizado',source:'OR-AS7-EXORCIZADO',skills:['Fortitude','Ocultismo']},
 {name:'Bodybuilder',source:'OR-MP-001',skills:['Atletismo','Fortitude'],conditional:[{id:'origem-bodybuilder-teste',label:'Saindo da Jaula',amount:5,requirement:'Gaste 2 PE em teste de FOR ou VIG, exceto Luta.'}]},
 {name:'Lutador',source:'OR-ALT-005',skills:['Luta','Reflexos'],conditional:[{id:'origem-lutador-manobra',label:'Lutador Exímio',amount:2,requirement:'+2 em manobras e no dano corpo a corpo, não nos ataques em geral.'}]}
]);
export const VERIFIED_POWER_EFFECTS=Object.freeze([
 {id:'poder-acrobacia',code:'ORION-ESP-ESPECIALIZACAO-ACROBATICA',classCode:'ESPECIALISTA',label:'Especialização Acrobática',sourceRef:'Manual consolidado Órion v0.15 · PO-ESP-003',target:'skill',skill:'Acrobacia',amount:5},
 {id:'poder-acrobacia-substituicao',code:'ORION-ESP-ESPECIALIZACAO-ACROBATICA',classCode:'ESPECIALISTA',label:'Especialização Acrobática · substituir perícia',sourceRef:'Manual consolidado Órion v0.15 · PO-ESP-003',target:'conditional',amount:0,context:'Usar Acrobacia no lugar de Atletismo somente para Saltar ou Escalar.'},
 {id:'poder-mira-infalivel',code:'ORION-ESP-MIRA-INFALIVEL',classCode:'ESPECIALISTA',label:'Mira Infalível',sourceRef:'Manual consolidado Órion v0.15 · PO-ESP-007',target:'conditional',amount:5,context:'Somente o próximo ataque com arma de disparo após Mirar; perde se mirar sem disparar.'},
 ...['COMBATENTE','ESPECIALISTA','OCULTISTA'].flatMap(classCode=>[
  {id:'poder-bom-samaritano-diplomacia',code:'ORION-GER-BOM-SAMARITANO',classCode,label:'Bom Samaritano · Diplomacia',sourceRef:'Manual consolidado Órion v0.15 · PO-GER-005',target:'skill',skill:'Diplomacia',amount:2},
  {id:'poder-bom-samaritano-religiao',code:'ORION-GER-BOM-SAMARITANO',classCode,label:'Bom Samaritano · Religião',sourceRef:'Manual consolidado Órion v0.15 · PO-GER-005',target:'skill',skill:'Religião',amount:2},
  {id:'poder-bom-samaritano-atitude',code:'ORION-GER-BOM-SAMARITANO',classCode,label:'Bom Samaritano · atitude',sourceRef:'Manual consolidado Órion v0.15 · PO-GER-005',target:'conditional',amount:1,context:'Atitude de seres não hostis aumenta em um passo; não afeta hostis.'}
 ])
]);
const TRAINING_VALUES=Object.freeze([0,5,10,15]);
const RANK_LABELS=Object.freeze(['Destreinado','Treinado','Veterano','Expert']);
function skillKey(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();}
/** Leitura única do grau de treinamento; inconsistências não produzem bônus. */
export function readSkillTraining(item){
 if(!item||typeof item!=='object'||Array.isArray(item))return {status:'ok',rank:0};
 const levels={destreinado:0,treinado:1,veterano:2,expert:3};
 const found=[];
 for(const key of ['training','rank','degree','level']){
  const v=item[key];
  if(v===undefined||v===null||String(v).trim()==='')continue;
  const normalized=skillKey(v);
  if(!Object.prototype.hasOwnProperty.call(levels,normalized))return {status:'unknown',rank:null,field:key};
  found.push(levels[normalized]);
 }
 if(new Set(found).size>1)return {status:'conflict',rank:null};
 const direct=found.length?found[0]:null;
 if((item.trained===false&&direct!==null&&direct>0)||(item.trained===true&&direct===0))return {status:'conflict',rank:null};
 return {status:'ok',rank:direct??(item.trained===true?1:0)};
}
function originSkillProjection(input,skills,attrs){
 const origin=VERIFIED_ORIGINS.find(o=>skillKey(o.name)===skillKey(input.origin))??null;
 const notices=[];
 if(String(input.origin??'').trim()&&!origin)notices.push('Origem não reconhecida no catálogo v0.15; nenhum efeito de origem inferido.');
 let list=input.skills_json??input.skills??[];
 try{list=typeof list==='string'?JSON.parse(list):list;}catch{list=null;}
 const invalid=!Array.isArray(list)||list.some(x=>!x||typeof x!=='object'||Array.isArray(x));
 if(invalid)notices.push('Perícias inválidas: treinamento e efeitos condicionais relacionados não calculados.');
 const manual=new Map(),duplicate=new Set(),ambiguous=new Set(),names=new Map();
 const collisions=conflictingSkillIdentities(list);
 const collisionNames=new Set(CREATION_SKILLS.filter(s=>
  collisions.codes.includes(s.code)).map(s=>skillKey(s.label)));
 // Also block the imported alias label itself. Otherwise a mismatched code
 // could still gain a separate manual training projection under a new name.
 if(Array.isArray(list))for(const row of list){
  const matched=CREATION_SKILLS.find(s=>skillKey(s.code)===skillKey(row?.code));
  if(matched&&collisions.codes.includes(matched.code))
   collisionNames.add(skillKey(row?.name??row?.label));
 }
 if(!collisions.valid&&Array.isArray(list))
  notices.push('Identidade das perícias não pôde ser conferida.');
 if(!invalid)for(const item of list){
  const n=String(item.name??item.label??'').trim(),k=skillKey(n);
  if(!k)continue;
  if(manual.has(k))duplicate.add(k);else manual.set(k,item);
  names.set(k,n);
 }
 for(const name of origin?.skills??[])names.set(skillKey(name),name);
 for(const name of Object.keys(skills))names.set(skillKey(name),name);
 for(const key of duplicate)notices.push('Perícia duplicada ('+key+'): total bloqueado para evitar acúmulo.');
 for(const key of collisionNames)notices.push('Perícia ambígua ('+key+'): cálculo bloqueado até esclarecer a identidade.');
 const training={},totals={};
 if(!invalid)for(const [key,name] of names){
  if(duplicate.has(key)||collisionNames.has(key))continue;
  const item=manual.get(key),resolved=readSkillTraining(item);
  if(resolved.status!=='ok'){ambiguous.add(key);notices.push(name+': treinamento conflitante ou desconhecido; cálculo bloqueado.');continue;}
  const logged=resolved.rank;
  const fromOrigin=!!origin?.skills.some(x=>skillKey(x)===key);
  const rank=Math.max(logged,fromOrigin?1:0);
  const skillParts=Object.entries(skills).filter(([n])=>skillKey(n)===key).flatMap(([,v])=>v.parts);
  const extra=skillParts.reduce((t,p)=>t+p.value,0);
  const source=fromOrigin?'Manual Órion v0.15 · '+origin.source:'Treinamento informado na ficha';
  const parts=rank?[part('Treinamento '+RANK_LABELS[rank],TRAINING_VALUES[rank],source,'training'),...skillParts]:skillParts;
  const raw=item?.bonus;
  const manualBonus=(typeof raw==='number'||typeof raw==='string')&&String(raw).trim()!==''?String(raw):null;
  training[name]={rank,grade:RANK_LABELS[rank],fromOrigin,registeredRank:logged,source};
  totals[name]={value:TRAINING_VALUES[rank]+extra,training:TRAINING_VALUES[rank],verifiedBonuses:extra,manualBonus,parts,limitations:['O campo manual não é somado: pode já conter treinamento, itens e bônus de outras fontes.']};
  if(fromOrigin&&!logged&&item)notices.push(name+': origem concede treinamento, mas o registro manual não indica; valor salvo não alterado.');
 }
 const conditional=[];
 for(const e of origin?.conditional??[]){
  if((invalid&&e.formula==='training-double')||duplicate.has(skillKey(e.skill))||
   collisionNames.has(skillKey(e.skill))||ambiguous.has(skillKey(e.skill)))continue;
  const rank=Object.entries(training).find(([n])=>skillKey(n)===skillKey(e.skill))?.[1].rank??0;
  // OR-ADD-012: grant only a read-only Block projection, never Defense.
  // Duplicate/unknown Fortitude training has already failed closed above.
  const tank=e.id==='origem-tanque-bloqueio'?
   previewTankBlock({origin:origin.name,fortitudeRank:rank}):null;
  if(tank&&!tank.valid)continue;
  const bombado=e.id==='origem-bombado-carga'?
   previewBombadoCapacity({origin:origin.name,strength:attrs.FOR,vigor:attrs.VIG}):null;
  if(bombado&&!bombado.valid)continue;
  const swimmer=e.id==='origem-mergulhador-folego'?
   previewSwimmerOrigin({origin:origin.name,vigor:attrs.VIG,level:Number(input.level)}):null;
  if(swimmer&&!swimmer.valid)continue;
  const value=tank?tank.blockBonus:bombado?bombado.originBonus:swimmer?swimmer.breathRounds:
   e.formula==='vigor'?attrs.VIG:e.formula==='vigor-double'?2*attrs.VIG:
   e.formula==='int'?attrs.INT:e.formula==='training-double'?2*rank:
   e.formula==='training'?TRAINING_VALUES[rank]:e.amount;
  conditional.push({id:e.id,value,label:e.label,requirement:e.requirement,source:'Manual Órion v0.15 · '+origin.source,
   ...(tank?{tankProjection:tank}:{}),
   ...(bombado?{bombadoCapacityProjection:bombado}:{}),
   ...(swimmer?{swimmerProjection:swimmer}:{}),
   ...(e.costPe!==undefined?{costPe:e.costPe}:{})});
 }
 return {origin:origin?{name:origin.name,source:'Manual Órion v0.15 · '+origin.source,declared:true}:null,training,totals,conditional,notices};
}
/** Planejamento explicativo: nenhum d20 é lançado, nenhuma ficha é alterada. */
export function planSkillTest(input,{skill,attribute=null}={}){
 const sheet=deriveSheet(input),requested=skillKey(skill);
 const found=Object.entries(sheet.effects.skillTotals).find(([n])=>skillKey(n)===requested);
 if(!found)return {status:'unavailable',skill:String(skill??''),reason:'Perícia sem cálculo confiável.'};
 let entries=input.skills_json??input.skills??[];
 try{entries=typeof entries==='string'?JSON.parse(entries):entries;}catch{entries=[];}
 const matches=Array.isArray(entries)?entries.filter(v=>v&&typeof v==='object'&&!Array.isArray(v)&&skillKey(v.name??v.label)===requested):[];
 const raw=attribute??(matches.length===1?matches[0].attribute:null);
 const codeText=String(raw??'').trim().toUpperCase();
 const aliases={agilidade:'AGI',forca:'FOR',intelecto:'INT',presenca:'PRE',vigor:'VIG'};
 const code=ATTRIBUTE_CODES.includes(codeText)?codeText:aliases[skillKey(raw)];
 if(!code)return {status:'attribute_required',skill:found[0],reason:'Informe AGI, FOR, INT, PRE ou VIG.'};
 const points=sheet.character.attributes[code],dice=points===0?2:points,keep=points===0?'menor':'maior';
 const total=found[1].value;
 return {status:'ready',skill:found[0],attribute:code,dice,kept:keep,bonus:total,
  expression:`${dice}d20 (manter ${keep}) ${total>=0?'+':'-'} ${Math.abs(total)}`,
  training:found[1].training,verifiedBonuses:found[1].verifiedBonuses,manualBonus:found[1].manualBonus,
  rolled:false,mutated:false,note:'Sem bônus manual, itens, condições ou gasto de PE.'};
}
function verifiedPowerGrants(input,classCode,level){
 const result=[],notices=[];
 const {items,invalid}=parseCanonicalAbilities(input.abilities_json??input.abilities);
 if(invalid){notices.push('Habilidades inválidas: Poderes N3 não calculados.');return {effects:result,notices};}
 if(level<3)return {effects:result,notices};
 for(const effect of VERIFIED_POWER_EFFECTS.filter(e=>e.classCode===classCode)){
  const matches=items.filter(a=>a&&typeof a==='object'&&!Array.isArray(a)&&a.code===effect.code&&a.source==='canonical-level-3'&&a.sourceRef===effect.sourceRef);
  if(matches.length===1)result.push(effect);
  else if(matches.length>1&&!notices.includes('Poder canônico duplicado: '+effect.code))notices.push('Poder canônico duplicado: '+effect.code);
 }
 return {effects:result,notices};
}

function parseCanonicalAbilities(value){
  let list;
  try{list=typeof value==='string'?JSON.parse(value):value;}catch{return {items:[],invalid:true};}
  if(list==null)return {items:[],invalid:false};
  return Array.isArray(list)?{items:list,invalid:false}:{items:[],invalid:true};
}
function verifiedTrackGrants(input,classCode,level){
  const track=String(input.track||'');
  const {items,invalid}=parseCanonicalAbilities(input.abilities_json??input.abilities);
  const notices=[];
  if(invalid)notices.push('Habilidades em formato inválido: nenhum bônus de Trilha foi inferido.');
  if(level<2||!track)return {effects:[],notices};
  const selected=VERIFIED_TRACK_EFFECTS.filter(e=>e.trackCode===track&&e.classCode===classCode);
  const result=[];
  for(const e of selected){
    const matches=items.filter(a=>a&&typeof a==='object'&&!Array.isArray(a)&&a.code===e.abilityCode&&a.source==='canonical-level-2'&&a.kind==='track'&&a.trackCode===track&&typeof a.sourceRef==='string'&&a.sourceRef==='Manual consolidado Órion v0.11 · '+e.abilityCode);
    if(matches.length===1)result.push(e);
    else if(matches.length>1)notices.push('Concessão canônica duplicada de '+e.label+': bônus não aplicado para evitar acúmulo.');
  }
  return {effects:result,notices};
}
function trackEffectValue(effect,level,attributes){
  if(effect.formula==='level')return level;
  if(effect.formula==='vigor')return attributes.VIG;
  return effect.amount;
}

/**
 * deriveSheet is a read-only projection. Does NOT alter level, EM or choices.
 * Age disadvantage metadata is optional and always disclosed when absent.
 */
export function deriveSheet(input,{ageDisadvantages=[],originAgeDisadvantage=null}={}) {
  if(!input||typeof input!=='object')throw new TypeError('Ficha ausente.');
  const classCode=input.class_code??input.classCode;
  if(!CLASSES.includes(classCode))throw new RangeError('Classe inválida.');
  const level=Number(input.level);
  if(!Number.isInteger(level)||level<1||level>20)throw new RangeError('Nível inválido.');
  const em=Number(input.em??input.em_balance??0);
  const nex=Number(input.nex??input.nex_percent??0);
  if(!Number.isInteger(em)||em<0)throw new RangeError('EM inválida.');
  if(!Number.isFinite(nex)||nex<0||nex>99)throw new RangeError('NEX inválido.');
  const age=Number(input.age??input.age_years??18);
  const stage=lifeStageForAge(age);
  if(!stage)throw new RangeError('Idade inválida para os estágios de vida da Órion (mínimo 16 anos).');
  const attrs=asAttributes(input.attributes_json??input.attributes??{});
  const formula=BASE[classCode];
  const steps=level-1;
  const sourceClass=RULE_PACK.sources.class;
  const pv=[part('PV inicial de classe',formula.pv,sourceClass),part('Vigor inicial',attrs.VIG,sourceClass),part('Crescimento por nível',steps*(formula.pvLevel+attrs.VIG),sourceClass,'progression')];
  const pe=[part('PE inicial de classe',formula.pe,sourceClass),part('Presença inicial',attrs.PRE,sourceClass),part('Crescimento por nível',steps*(formula.peLevel+attrs.PRE),sourceClass,'progression')];
  const san=[part('SAN inicial de classe',formula.san,sourceClass),part('Crescimento por nível',steps*formula.sanLevel,sourceClass,'progression')];
  const pePerTurn=[part('Nível',level,RULE_PACK.sources.level),...(stage==='PRODIGIO'?[part('Jovem Imparável',1,RULE_PACK.sources.age,'age')]:[])];
  const allDisadvantages=new Set([...ageDisadvantages,originAgeDisadvantage].filter(Boolean));
  if(stage==='PRODIGIO')pe.push(part('Jovem Imparável',level,RULE_PACK.sources.age,'age'));
  if(allDisadvantages.has('FRAGIL')||allDisadvantages.has('FRAGIL_BASE'))pv.push(part('Frágil',-2*level,RULE_PACK.sources.age,'age'));
  if(allDisadvantages.has('MELANCOLICO')||allDisadvantages.has('MELANCOLICO_BASE'))pe.push(part('Melancólico',-level,RULE_PACK.sources.age,'age'));
  const granted=verifiedTrackGrants(input,classCode,level);
  const powers=verifiedPowerGrants(input,classCode,level);
  const appliedEffects=[];
  // Máximos são projeções: nunca reescrever pv/pe/san atuais da ficha.
  // A criação N1 só pode ativar origens verificadas pelo Worker.
  const originMaximum=VERIFIED_ORIGINS.find(o=>skillKey(o.name)===skillKey(input.origin))??null;
  const originMaxima=['Vítima','Universitário'].includes(originMaximum?.name)?
    previewOriginMaxima({origin:originMaximum.name,level}):null;
  for(const rule of originMaximum?.maximum??[]){
    const destination={pv,pe,san,pePerTurn}[rule.target];
    if(!destination)continue;
    const swimmer=rule.id==='origem-mergulhador-pv'?
      previewSwimmerOrigin({origin:originMaximum.name,vigor:attrs.VIG,level}):null;
    // Preserve the historical constant +5 PV even if a malformed attribute
    // makes the breath projection unavailable. Creation validation still gates it.
    const value=rule.id==='origem-vitima-san'&&originMaxima?.valid?
      originMaxima.sanMaxBonus:
      rule.id==='origem-universitario-pe'&&originMaxima?.valid?
      originMaxima.peMaxBonus:
      rule.id==='origem-universitario-limite-pe'&&originMaxima?.valid?
      originMaxima.pePerTurnBonus:
      rule.formula==='level'?level:
      rule.formula==='odd-level-pe'?Math.ceil(level/2):
      swimmer?.valid?swimmer.maxPvBonus:
      rule.formula==='fixed'?rule.amount:null;
    if(!Number.isSafeInteger(value)||value<0)continue;
    destination.push(part(rule.label,value,originMaximum.source,'origin'));
    appliedEffects.push({id:rule.id,target:rule.target,value,label:rule.label,source:originMaximum.source,
      ...(swimmer?.valid?{swimmerProjection:swimmer}:{}),
      ...(['origem-vitima-san','origem-universitario-pe'].includes(rule.id)&&originMaxima?.valid?
        {originMaximaProjection:originMaxima}:{})});
  }
  const skillBonuses={};
  const conditionalEffects=[];
  for(const effect of [...granted.effects,...powers.effects]){
    const bonus=trackEffectValue(effect,level,attrs);
    if(effect.target==='pv'){
      pv.push(part(effect.label,bonus,effect.source,'track'));
      appliedEffects.push({id:effect.id,target:'pv',value:bonus,label:effect.label,source:effect.source});
    }else if(effect.target==='skill'){
      const skill=effect.skill;
      const sourcePart=part(effect.label,bonus,effect.sourceRef??effect.source,effect.code?'power':'track');
      const entry=skillBonuses[skill]??{value:0,parts:[],limitations:['Treinamento e valores manuais são apresentados separadamente.']};
      // Uma mesma habilidade só é processada uma vez, mesmo em JSON duplicado.
      entry.value+=bonus;entry.parts.push(sourcePart);skillBonuses[skill]=entry;
      appliedEffects.push({id:effect.id,target:'skill:'+skill,value:bonus,label:effect.label,source:effect.sourceRef??effect.source});
    }else if(effect.target==='conditional'){
      conditionalEffects.push({id:effect.id,value:bonus,label:effect.label,requirement:effect.context,source:effect.sourceRef??effect.source});
    }
  }
  const originPreview=originSkillProjection(input,skillBonuses,attrs);
  conditionalEffects.push(...originPreview.conditional);
  const limits=['Itens, habilidades fora do catálogo e modificadores temporários não são automatizados; Origem declarada exige conferência.'];
  if(granted.notices.length)limits.push(...granted.notices);
  limits.push(...powers.notices,...originPreview.notices);
  if(stage==='MADURO'||stage==='IDOSO')limits.push('Desvantagens etárias não estão estruturadas no schema v0.1.0; informe-as manualmente para prévia completa.');
  const availableLevel=levelForEm(em);
  const nextThreshold=nextLevelEm(level);
  const choices=level===20?[]:classLevelMilestone(classCode,level+1).choices;
  return {
    rules: RULE_PACK,
    character: {classCode,level,age,lifeStage:stage,nex,em,attributes:attrs},
    values: {
      pv:measure(pv,limits), pe:measure(pe,limits), san:measure(san,limits),
      pePerTurn:measure(pePerTurn),
      defenseBase:measure([part('Defesa base',10,RULE_PACK.sources.defense),part('Agilidade',attrs.AGI,RULE_PACK.sources.defense)],['Não inclui proteção, esquiva ou efeitos.'])
    },
    effects: {
      applied:appliedEffects,
      skillBonuses,
      skillTraining:originPreview.training,
      skillTotals:originPreview.totals,
      origin:originPreview.origin,
      conditional:conditionalEffects,
      note:'Trilhas N2 e Poderes N3 exigem concessões canônicas; origens são declaradas. Treinamento de origem não duplica. Efeitos condicionais e bônus manuais ficam separados.'
    },
    progression: {
      availableLevel, currentLevel:level,
      nextLevel:level===20?null:level+1,
      requiredEm:nextThreshold,
      missingEm:nextThreshold===null?0:Math.max(0,nextThreshold-em),
      eligible:availableLevel>level && level<20,
      pendingChoices:choices,
      // Preview only: never infer or auto-apply a track or ritual.
      automaticAdvancement:false
    },
    warnings: [...(level===1?checkCreationAttributes(attrs):[]),...(stage==='PRODIGIO'?['Restrições de atributos do Prodígio ainda não são verificadas nesta prévia.']:[]),...limits],
    canonical:false
  };
}
