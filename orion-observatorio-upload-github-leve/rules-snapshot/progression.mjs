/**
 * Catálogo validado parcial da Órion Fichas: 1 -> 2 e 2 -> 3.
 * Trilhas com configuração inicial suportada são validadas por esquema.
 * Outras Trilhas com opções não modeladas permanecem bloqueadas.
 * As referências são metadados, não cópia das descrições dos livros.
 */
import {deriveSheet, RULE_PACK, checkCreationAttributes, classLevelMilestone, readSkillTraining, lifeStageForAge} from './index.mjs';
import {reviewPowerPrerequisites,reviewTrackPrerequisites,originalPrerequisiteCatalog,prerequisiteSkillRank,isChronologicalGrantSource,hasInconsistentCanonicalGrantHistory} from './progression-eligibility.mjs';
import {MANUAL_RITUALS} from './manual-items.mjs';
import {TRACK_BY_CODE} from './progression-prerequisites.mjs';
import {trainingOptions7,validateTraining7,trainingOptions14,validateTraining14} from './training-n7.mjs';
import {reviewProdigyAttributeIncrease} from './prodigy-progression-rule.mjs';
export const PROGRESSION_RULESET='orion-2026-stabilization-0.5.19';
/**
 * Manual consolidado Órion v0.11; marcos convertidos de NEX para Nível.
 * `pending_configuration`: trilha AUTORIZADA pelo manual, mas ainda impossível
 * conceder corretamente sem suas escolhas derivadas (arma, perícia, elemento etc.).
 * A ficha armazena a habilidade nominal, nunca infere seus bônus numéricos.
 */
export const LEVEL2_TRACKS=Object.freeze([
 {
  "code":"COM_ANI",
  "classCode":"COMBATENTE",
  "label":"Aniquilador",
  "approval":"configured",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-COM-ANI-02",
    "label":"A Favorita",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-ANI-02"
   },
   {
    "level":8,
    "code":"TR-COM-ANI-08",
    "label":"Técnica Secreta",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-ANI-08"
   },
   {
    "level":13,
    "code":"TR-COM-ANI-13",
    "label":"Técnica Sublime",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-ANI-13"
   },
   {
    "level":20,
    "code":"TR-COM-ANI-20",
    "label":"Máquina de Matar",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-ANI-20"
   }
  ]
 },
 {
  "code":"COM_GUE",
  "classCode":"COMBATENTE",
  "label":"Guerreiro",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-COM-GUE-02",
    "label":"Técnica Letal",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-GUE-02"
   },
   {
    "level":8,
    "code":"TR-COM-GUE-08",
    "label":"Revidar",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-GUE-08"
   },
   {
    "level":13,
    "code":"TR-COM-GUE-13",
    "label":"Força Opressora",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-GUE-13"
   },
   {
    "level":20,
    "code":"TR-COM-GUE-20",
    "label":"Potência Máxima",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-GUE-20"
   }
  ]
 },
 {
  "code":"COM_OPE",
  "classCode":"COMBATENTE",
  "label":"Operações Especiais",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-COM-OPE-02",
    "label":"Iniciativa Aprimorada",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-OPE-02"
   },
   {
    "level":8,
    "code":"TR-COM-OPE-08",
    "label":"Ataque Extra",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-OPE-08"
   },
   {
    "level":13,
    "code":"TR-COM-OPE-13",
    "label":"Surto de Adrenalina",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-OPE-13"
   },
   {
    "level":20,
    "code":"TR-COM-OPE-20",
    "label":"Sempre Alerta",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-OPE-20"
   }
  ]
 },
 {
  "code":"COM_CHA",
  "classCode":"COMBATENTE",
  "label":"Comandante de Campo",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-COM-CMD-02",
    "label":"Inspirar Confiança",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-CMD-02"
   },
   {
    "level":8,
    "code":"TR-COM-CMD-08",
    "label":"Estrategista",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-CMD-08"
   },
   {
    "level":13,
    "code":"TR-COM-CMD-13",
    "label":"Brecha na Guarda",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-CMD-13"
   },
   {
    "level":20,
    "code":"TR-COM-CMD-20",
    "label":"Oficial Comandante",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-CMD-20"
   }
  ]
 },
 {
  "code":"COM_TRO",
  "classCode":"COMBATENTE",
  "label":"Tropa de Choque",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-COM-TRO-02",
    "label":"Casca Grossa",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-TRO-02"
   },
   {
    "level":8,
    "code":"TR-COM-TRO-08",
    "label":"Anjo da Guarda",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-TRO-08"
   },
   {
    "level":13,
    "code":"TR-COM-TRO-13",
    "label":"Técnicas de Defesa",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-TRO-13"
   },
   {
    "level":20,
    "code":"TR-COM-TRO-20",
    "label":"Inquebrável",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-TRO-20"
   }
  ]
 },
 {
  "code":"COM_AGE",
  "classCode":"COMBATENTE",
  "label":"Agente Secreto",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-COM-AGE-02",
    "label":"Carteirada",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-AGE-02"
   },
   {
    "level":8,
    "code":"TR-COM-AGE-08",
    "label":"O Sorriso",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-AGE-08"
   },
   {
    "level":13,
    "code":"TR-COM-AGE-13",
    "label":"Método Investigativo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-AGE-13"
   },
   {
    "level":20,
    "code":"TR-COM-AGE-20",
    "label":"Multifacetado",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-AGE-20"
   }
  ]
 },
 {
  "code":"COM_CAC",
  "classCode":"COMBATENTE",
  "label":"Caçador",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-COM-CAC-02",
    "label":"Rastrear o Paranormal",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-CAC-02"
   },
   {
    "level":8,
    "code":"TR-COM-CAC-08",
    "label":"Estudar Fraquezas",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-CAC-08"
   },
   {
    "level":13,
    "code":"TR-COM-CAC-13",
    "label":"Atacar das Sombras",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-CAC-13"
   },
   {
    "level":20,
    "code":"TR-COM-CAC-20",
    "label":"Estudar a Presa",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-CAC-20"
   }
  ]
 },
 {
  "code":"COM_ANA",
  "classCode":"COMBATENTE",
  "label":"Analítico",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-COM-ANA-02",
    "label":"Identificar Fraqueza",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-ANA-02"
   },
   {
    "level":8,
    "code":"TR-COM-ANA-08",
    "label":"De Novo Não!",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-ANA-08"
   },
   {
    "level":13,
    "code":"TR-COM-ANA-13",
    "label":"Foi por Pouco…",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-ANA-13"
   },
   {
    "level":20,
    "code":"TR-COM-ANA-20",
    "label":"Frio e Calculista",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-ANA-20"
   }
  ]
 },
 {
  "code":"COM_ARQ",
  "classCode":"COMBATENTE",
  "label":"Arqueiro",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-COM-ARQ-02",
    "label":"Olho de Águia",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-ARQ-02"
   },
   {
    "level":8,
    "code":"TR-COM-ARQ-08",
    "label":"Área de Foco",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-ARQ-08"
   },
   {
    "level":13,
    "code":"TR-COM-ARQ-13",
    "label":"Chuva de Flechas",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-ARQ-13"
   },
   {
    "level":20,
    "code":"TR-COM-ARQ-20",
    "label":"Discípulo de Apolo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-ARQ-20"
   }
  ]
 },
 {
  "code":"COM_OND",
  "classCode":"COMBATENTE",
  "label":"Combatente de Ondas",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-COM-OND-02",
    "label":"Hora do Show",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-OND-02"
   },
   {
    "level":8,
    "code":"TR-COM-OND-08",
    "label":"Apresentação em Dupla",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-OND-08"
   },
   {
    "level":13,
    "code":"TR-COM-OND-13",
    "label":"Sob os Holofotes",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-OND-13"
   },
   {
    "level":20,
    "code":"TR-COM-OND-20",
    "label":"Bravo!",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-OND-20"
   }
  ]
 },
 {
  "code":"COM_DEV",
  "classCode":"COMBATENTE",
  "label":"Devoto Aberrante",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-COM-DEV-02",
    "label":"Receptáculo Paranormal",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-DEV-02"
   },
   {
    "level":8,
    "code":"TR-COM-DEV-08",
    "label":"Aberração do Outro Lado",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-DEV-08"
   },
   {
    "level":13,
    "code":"TR-COM-DEV-13",
    "label":"Criatura Abominável",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-DEV-13"
   },
   {
    "level":20,
    "code":"TR-COM-DEV-20",
    "label":"Físico Elemental",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-DEV-20"
   }
  ]
 },
 {
  "code":"COM_PIS",
  "classCode":"COMBATENTE",
  "label":"Pistoleiro",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-COM-PIS-02",
    "label":"Bala no Alvo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-PIS-02"
   },
   {
    "level":8,
    "code":"TR-COM-PIS-08",
    "label":"Duelista Ágil",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-PIS-08"
   },
   {
    "level":13,
    "code":"TR-COM-PIS-13",
    "label":"Contrato de Abate",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-PIS-13"
   },
   {
    "level":20,
    "code":"TR-COM-PIS-20",
    "label":"Acerto de Contas",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-COM-PIS-20"
   }
  ]
 },
 {
  "code":"ESP_ATI",
  "classCode":"ESPECIALISTA",
  "label":"Atirador de Elite",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-ATI-02",
    "label":"Mira de Elite",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ATI-02"
   },
   {
    "level":8,
    "code":"TR-ESP-ATI-08",
    "label":"Disparo Letal",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ATI-08"
   },
   {
    "level":13,
    "code":"TR-ESP-ATI-13",
    "label":"Disparo Impactante",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ATI-13"
   },
   {
    "level":20,
    "code":"TR-ESP-ATI-20",
    "label":"Atirar para Matar",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ATI-20"
   }
  ]
 },
 {
  "code":"ESP_INF",
  "classCode":"ESPECIALISTA",
  "label":"Infiltrador",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-INF-02",
    "label":"Ataque Furtivo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-INF-02"
   },
   {
    "level":8,
    "code":"TR-ESP-INF-08",
    "label":"Gatuno",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-INF-08"
   },
   {
    "level":13,
    "code":"TR-ESP-INF-13",
    "label":"Sombra Fugaz",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-INF-13"
   },
   {
    "level":20,
    "code":"TR-ESP-INF-20",
    "label":"Assassinar",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-INF-20"
   }
  ]
 },
 {
  "code":"ESP_MED",
  "classCode":"ESPECIALISTA",
  "label":"Médico de Campo",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-MED-02",
    "label":"Paramédico",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-MED-02"
   },
   {
    "level":8,
    "code":"TR-ESP-MED-08",
    "label":"Equipe de Trauma",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-MED-08"
   },
   {
    "level":13,
    "code":"TR-ESP-MED-13",
    "label":"Equipe de Resgate",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-MED-13"
   },
   {
    "level":20,
    "code":"TR-ESP-MED-20",
    "label":"Médico em Plantão",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-MED-20"
   }
  ]
 },
 {
  "code":"ESP_NEG",
  "classCode":"ESPECIALISTA",
  "label":"Negociador",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-NEG-02",
    "label":"Eloquência",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-NEG-02"
   },
   {
    "level":8,
    "code":"TR-ESP-NEG-08",
    "label":"Discurso Motivador",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-NEG-08"
   },
   {
    "level":13,
    "code":"TR-ESP-NEG-13",
    "label":"Eu Conheço um Cara",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-NEG-13"
   },
   {
    "level":20,
    "code":"TR-ESP-NEG-20",
    "label":"Truque de Mestre",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-NEG-20"
   }
  ]
 },
 {
  "code":"ESP_TEC",
  "classCode":"ESPECIALISTA",
  "label":"Técnico",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-TEC-02",
    "label":"Inventário Otimizado",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-TEC-02"
   },
   {
    "level":8,
    "code":"TR-ESP-TEC-08",
    "label":"Remendão",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-TEC-08"
   },
   {
    "level":13,
    "code":"TR-ESP-TEC-13",
    "label":"Improvisar",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-TEC-13"
   },
   {
    "level":20,
    "code":"TR-ESP-TEC-20",
    "label":"Preparado para Tudo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-TEC-20"
   }
  ]
 },
 {
  "code":"ESP_BIB",
  "classCode":"ESPECIALISTA",
  "label":"Bibliotecário",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-BIB-02",
    "label":"Conhecimento Prático",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-BIB-02"
   },
   {
    "level":8,
    "code":"TR-ESP-BIB-08",
    "label":"Leitor Contumaz",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-BIB-08"
   },
   {
    "level":13,
    "code":"TR-ESP-BIB-13",
    "label":"Rato de Biblioteca",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-BIB-13"
   },
   {
    "level":20,
    "code":"TR-ESP-BIB-20",
    "label":"A Força do Saber",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-BIB-20"
   }
  ]
 },
 {
  "code":"ESP_PER",
  "classCode":"ESPECIALISTA",
  "label":"Perseverante",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-PER-02",
    "label":"Soluções Improvisadas",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-PER-02"
   },
   {
    "level":8,
    "code":"TR-ESP-PER-08",
    "label":"Fuga Obstinada",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-PER-08"
   },
   {
    "level":13,
    "code":"TR-ESP-PER-13",
    "label":"Determinação Inquestionável",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-PER-13"
   },
   {
    "level":20,
    "code":"TR-ESP-PER-20",
    "label":"Só Mais um Passo…",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-PER-20"
   }
  ]
 },
 {
  "code":"ESP_MUA",
  "classCode":"ESPECIALISTA",
  "label":"Muambeiro",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-MUA-02",
    "label":"Mascate",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-MUA-02"
   },
   {
    "level":8,
    "code":"TR-ESP-MUA-08",
    "label":"Fabricação Própria",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-MUA-08"
   },
   {
    "level":13,
    "code":"TR-ESP-MUA-13",
    "label":"Laboratório de Campo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-MUA-13"
   },
   {
    "level":20,
    "code":"TR-ESP-MUA-20",
    "label":"Achado Conveniente",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-MUA-20"
   }
  ]
 },
 {
  "code":"ESP_ADE",
  "classCode":"ESPECIALISTA",
  "label":"Adestrador",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-ADE-02",
    "label":"Companheiro Animal",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ADE-02"
   },
   {
    "level":8,
    "code":"TR-ESP-ADE-08",
    "label":"Para Sempre Juntos",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ADE-08"
   },
   {
    "level":13,
    "code":"TR-ESP-ADE-13",
    "label":"Fera Versátil",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ADE-13"
   },
   {
    "level":20,
    "code":"TR-ESP-ADE-20",
    "label":"Amigos Para Sempre",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ADE-20"
   }
  ]
 },
 {
  "code":"ESP_BOM",
  "classCode":"ESPECIALISTA",
  "label":"Bombardeiro",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-BOM-02",
    "label":"Espírito Demolidor",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-BOM-02"
   },
   {
    "level":8,
    "code":"TR-ESP-BOM-08",
    "label":"Arte Explosiva",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-BOM-08"
   },
   {
    "level":13,
    "code":"TR-ESP-BOM-13",
    "label":"Mestre em Destruição",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-BOM-13"
   },
   {
    "level":20,
    "code":"TR-ESP-BOM-20",
    "label":"Tsar",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-BOM-20"
   }
  ]
 },
 {
  "code":"ESP_EMB",
  "classCode":"ESPECIALISTA",
  "label":"Emboscador",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-EMB-02",
    "label":"Dia de Caça",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-EMB-02"
   },
   {
    "level":8,
    "code":"TR-ESP-EMB-08",
    "label":"Caçador Inato",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-EMB-08"
   },
   {
    "level":13,
    "code":"TR-ESP-EMB-13",
    "label":"Estilo Animal",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-EMB-13"
   },
   {
    "level":20,
    "code":"TR-ESP-EMB-20",
    "label":"Eu Sou o Caçador",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-EMB-20"
   }
  ]
 },
 {
  "code":"ESP_ENG",
  "classCode":"ESPECIALISTA",
  "label":"Engenheiro",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-ENG-02",
    "label":"Sentry Comin' Up!",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ENG-02"
   },
   {
    "level":8,
    "code":"TR-ESP-ENG-08",
    "label":"That's Gettin' Heavy!",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ENG-08"
   },
   {
    "level":13,
    "code":"TR-ESP-ENG-13",
    "label":"Erecting a Dispenser!",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ENG-13"
   },
   {
    "level":20,
    "code":"TR-ESP-ENG-20",
    "label":"Heavy Load Comin' Through!",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ENG-20"
   }
  ]
 },
 {
  "code":"ESP_EST",
  "classCode":"ESPECIALISTA",
  "label":"Estrategista",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-EST-02",
    "label":"Roque Repentino",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-EST-02"
   },
   {
    "level":8,
    "code":"TR-ESP-EST-08",
    "label":"En Passant",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-EST-08"
   },
   {
    "level":13,
    "code":"TR-ESP-EST-13",
    "label":"Promoção de Peão",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-EST-13"
   },
   {
    "level":20,
    "code":"TR-ESP-EST-20",
    "label":"Xeque-Mate",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-EST-20"
   }
  ]
 },
 {
  "code":"ESP_ESP",
  "classCode":"ESPECIALISTA",
  "label":"Espadachim",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-ESP-02",
    "label":"En Garde",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ESP-02"
   },
   {
    "level":8,
    "code":"TR-ESP-ESP-08",
    "label":"Emissário da Batalha",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ESP-08"
   },
   {
    "level":13,
    "code":"TR-ESP-ESP-13",
    "label":"Grande Desafio",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ESP-13"
   },
   {
    "level":20,
    "code":"TR-ESP-ESP-20",
    "label":"Florescer Espiritual",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ESP-20"
   }
  ]
 },
 {
  "code":"ESP_MUS",
  "classCode":"ESPECIALISTA",
  "label":"Músico",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-MUS-02",
    "label":"Bardo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-MUS-02"
   },
   {
    "level":8,
    "code":"TR-ESP-MUS-08",
    "label":"Musicoterapia",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-MUS-08"
   },
   {
    "level":13,
    "code":"TR-ESP-MUS-13",
    "label":"Inspiração",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-MUS-13"
   },
   {
    "level":20,
    "code":"TR-ESP-MUS-20",
    "label":"Artista Completo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-MUS-20"
   }
  ]
 },
 {
  "code":"ESP_ROB",
  "classCode":"ESPECIALISTA",
  "label":"Roboticista",
  "approval":"configured",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-001",
  "abilities":[
   {
    "level":2,
    "code":"TR-ESP-ROB-02",
    "label":"Protótipo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ROB-02"
   },
   {
    "level":8,
    "code":"TR-ESP-ROB-08",
    "label":"Aprimoramento",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ROB-08"
   },
   {
    "level":13,
    "code":"TR-ESP-ROB-13",
    "label":"Gloriosa Evolução",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ROB-13"
   },
   {
    "level":20,
    "code":"TR-ESP-ROB-20",
    "label":"Engenharia Perfeita",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-ESP-ROB-20"
   }
  ]
 },
 {
  "code":"OCU_CON",
  "classCode":"OCULTISTA",
  "label":"Conduíte",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-001A",
  "abilities":[
   {
    "level":2,
    "code":"TR-OCU-CON-02",
    "label":"Ampliar Ritual",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-CON-02"
   },
   {
    "level":8,
    "code":"TR-OCU-CON-08",
    "label":"Acelerar Ritual",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-CON-08"
   },
   {
    "level":13,
    "code":"TR-OCU-CON-13",
    "label":"Anular Ritual",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-CON-13"
   },
   {
    "level":20,
    "code":"TR-OCU-CON-20",
    "label":"Canalizar o Medo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-CON-20"
   }
  ]
 },
 {
  "code":"OCU_INT",
  "classCode":"OCULTISTA",
  "label":"Intuitivo",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-001A",
  "abilities":[
   {
    "level":2,
    "code":"TR-OCU-INT-02",
    "label":"Mente Sã",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-INT-02"
   },
   {
    "level":8,
    "code":"TR-OCU-INT-08",
    "label":"Presença Poderosa",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-INT-08"
   },
   {
    "level":13,
    "code":"TR-OCU-INT-13",
    "label":"Inabalável",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-INT-13"
   },
   {
    "level":20,
    "code":"TR-OCU-INT-20",
    "label":"Presença do Medo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-INT-20"
   }
  ]
 },
 {
  "code":"OCU_FLA",
  "classCode":"OCULTISTA",
  "label":"Flagelador",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-001A",
  "abilities":[
   {
    "level":2,
    "code":"TR-OCU-FLA-02",
    "label":"Poder do Flagelo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-FLA-02"
   },
   {
    "level":8,
    "code":"TR-OCU-FLA-08",
    "label":"Abraçar a Dor",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-FLA-08"
   },
   {
    "level":13,
    "code":"TR-OCU-FLA-13",
    "label":"Absorver Agonia",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-FLA-13"
   },
   {
    "level":20,
    "code":"TR-OCU-FLA-20",
    "label":"Medo Tangível",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-FLA-20"
   }
  ]
 },
 {
  "code":"OCU_GRA",
  "classCode":"OCULTISTA",
  "label":"Graduado",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-001A",
  "abilities":[
   {
    "level":2,
    "code":"TR-OCU-GRA-02",
    "label":"Grimório Ritualístico",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-GRA-02"
   },
   {
    "level":8,
    "code":"TR-OCU-GRA-08",
    "label":"Improvisar Selo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-GRA-08"
   },
   {
    "level":13,
    "code":"TR-OCU-GRA-13",
    "label":"Rituais Eficientes",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-GRA-13"
   },
   {
    "level":20,
    "code":"TR-OCU-GRA-20",
    "label":"Conhecendo o Medo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-GRA-20"
   }
  ]
 },
 {
  "code":"OCU_LAM",
  "classCode":"OCULTISTA",
  "label":"Lâmina Paranormal",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-001A",
  "abilities":[
   {
    "level":2,
    "code":"TR-OCU-LAM-02",
    "label":"Armamento Maldito",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-LAM-02"
   },
   {
    "level":8,
    "code":"TR-OCU-LAM-08",
    "label":"Gladiador Paranormal",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-LAM-08"
   },
   {
    "level":13,
    "code":"TR-OCU-LAM-13",
    "label":"Conjuração Marcial",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-LAM-13"
   },
   {
    "level":20,
    "code":"TR-OCU-LAM-20",
    "label":"Lâmina do Medo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-LAM-20"
   }
  ]
 },
 {
  "code":"OCU_EXO",
  "classCode":"OCULTISTA",
  "label":"Exorcista",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-001A",
  "abilities":[
   {
    "level":2,
    "code":"TR-OCU-EXO-02",
    "label":"Revelação do Mal",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-EXO-02"
   },
   {
    "level":8,
    "code":"TR-OCU-EXO-08",
    "label":"Poder da Fé",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-EXO-08"
   },
   {
    "level":13,
    "code":"TR-OCU-EXO-13",
    "label":"Parareligiosidade",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-EXO-13"
   },
   {
    "level":20,
    "code":"TR-OCU-EXO-20",
    "label":"Chagas da Resistência",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-EXO-20"
   }
  ]
 },
 {
  "code":"OCU_PAR",
  "classCode":"OCULTISTA",
  "label":"Parapsicólogo",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-001A",
  "abilities":[
   {
    "level":2,
    "code":"TR-OCU-PAR-02",
    "label":"Terapia",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-PAR-02"
   },
   {
    "level":8,
    "code":"TR-OCU-PAR-08",
    "label":"Palavras-Chave",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-PAR-08"
   },
   {
    "level":13,
    "code":"TR-OCU-PAR-13",
    "label":"Reprogramação Mental",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-PAR-13"
   },
   {
    "level":20,
    "code":"TR-OCU-PAR-20",
    "label":"A Sanidade Está Lá Fora",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-PAR-20"
   }
  ]
 },
 {
  "code":"OCU_ALQ",
  "classCode":"OCULTISTA",
  "label":"Alquimista Paranormal",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-001A",
  "abilities":[
   {
    "level":2,
    "code":"TR-OCU-ALQ-02",
    "label":"Fórmula Secreta",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-ALQ-02"
   },
   {
    "level":8,
    "code":"TR-OCU-ALQ-08",
    "label":"Efeito Gasoso",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-ALQ-08"
   },
   {
    "level":13,
    "code":"TR-OCU-ALQ-13",
    "label":"Junção Perigosa",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-ALQ-13"
   },
   {
    "level":20,
    "code":"TR-OCU-ALQ-20",
    "label":"Elixir de Deus",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-ALQ-20"
   }
  ]
 },
 {
  "code":"OCU_ARM",
  "classCode":"OCULTISTA",
  "label":"Armeiro",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-001A",
  "abilities":[
   {
    "level":2,
    "code":"TR-OCU-ARM-02",
    "label":"Arsenal Maldito",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-ARM-02"
   },
   {
    "level":8,
    "code":"TR-OCU-ARM-08",
    "label":"Aprimoramento Elemental",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-ARM-08"
   },
   {
    "level":13,
    "code":"TR-OCU-ARM-13",
    "label":"Transmutação Macabra",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-ARM-13"
   },
   {
    "level":20,
    "code":"TR-OCU-ARM-20",
    "label":"Ferreiro do Medão",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-ARM-20"
   }
  ]
 },
 {
  "code":"OCU_FEI",
  "classCode":"OCULTISTA",
  "label":"Feiticeiro",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-001A",
  "abilities":[
   {
    "level":2,
    "code":"TR-OCU-FEI-02",
    "label":"Técnica Inata",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-FEI-02"
   },
   {
    "level":8,
    "code":"TR-OCU-FEI-08",
    "label":"Extensão de Poder",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-FEI-08"
   },
   {
    "level":13,
    "code":"TR-OCU-FEI-13",
    "label":"Maestria Ritualística",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-FEI-13"
   },
   {
    "level":20,
    "code":"TR-OCU-FEI-20",
    "label":"Ritual Perfeito",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-FEI-20"
   }
  ]
 },
 {
  "code":"OCU_ILU",
  "classCode":"OCULTISTA",
  "label":"Ilusionista",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-001A",
  "abilities":[
   {
    "level":2,
    "code":"TR-OCU-ILU-02",
    "label":"Truque Sujo",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-ILU-02"
   },
   {
    "level":8,
    "code":"TR-OCU-ILU-08",
    "label":"Mentiroso Profissional",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-ILU-08"
   },
   {
    "level":13,
    "code":"TR-OCU-ILU-13",
    "label":"Mais Sujo que o Mal Lavado",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-ILU-13"
   },
   {
    "level":20,
    "code":"TR-OCU-ILU-20",
    "label":"Verdade Ilusória",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-ILU-20"
   }
  ]
 },
 {
  "code":"OCU_INV",
  "classCode":"OCULTISTA",
  "label":"Invocador",
  "approval":"pending_configuration",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-001A",
  "abilities":[
   {
    "level":2,
    "code":"TR-OCU-INV-02",
    "label":"Invocar da Besta",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-INV-02"
   },
   {
    "level":8,
    "code":"TR-OCU-INV-08",
    "label":"Demônio de Excelência",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-INV-08"
   },
   {
    "level":13,
    "code":"TR-OCU-INV-13",
    "label":"Demônio Paranormal",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-INV-13"
   },
   {
    "level":20,
    "code":"TR-OCU-INV-20",
    "label":"Controlar Demônio",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-INV-20"
   }
  ]
 },
 {
  "code":"OCU_PIN",
  "classCode":"OCULTISTA",
  "label":"Pintor Deslumbrante",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-001A",
  "abilities":[
   {
    "level":2,
    "code":"TR-OCU-PIN-02",
    "label":"O Criador",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-PIN-02"
   },
   {
    "level":8,
    "code":"TR-OCU-PIN-08",
    "label":"Poder Respingante",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-PIN-08"
   },
   {
    "level":13,
    "code":"TR-OCU-PIN-13",
    "label":"Dilúvio de Tinta",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-PIN-13"
   },
   {
    "level":20,
    "code":"TR-OCU-PIN-20",
    "label":"A Imagem Cristalina de Deus",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-PIN-20"
   }
  ]
 },
 {
  "code":"OCU_RED",
  "classCode":"OCULTISTA",
  "label":"Redentor",
  "approval":"curated",
  "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-001A",
  "abilities":[
   {
    "level":2,
    "code":"TR-OCU-RED-02",
    "label":"Medicina Paranormal",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-RED-02"
   },
   {
    "level":8,
    "code":"TR-OCU-RED-08",
    "label":"Amar é Enlouquecer",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-RED-08"
   },
   {
    "level":13,
    "code":"TR-OCU-RED-13",
    "label":"Aura Guardiã",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-RED-13"
   },
   {
    "level":20,
    "code":"TR-OCU-RED-20",
    "label":"Ninguém Fica para Trás",
    "sourceRef":"Manual consolidado Órion v0.11 · TR-OCU-RED-20"
   }
  ]
 }
]);
export const TRACK_MILESTONES=Object.freeze([2,8,13,20]);
export const BLOCKED_TRACKS=Object.freeze([
 {classCode:'COMBATENTE',label:'Monstruoso',reason:'Proibido no Projeto Órion · TR-COM-001'},
 {classCode:'ESPECIALISTA',label:'Monstruoso',reason:'Não entrou no Projeto Órion · AS7-PEND-001'},
 {classCode:'OCULTISTA',label:'Monstruoso',reason:'Não entrou no Projeto Órion · AS7-PEND-001'},
 {classCode:'OCULTISTA',label:'Possuído',reason:'Proibido no Projeto Órion · TR-OCU-001'}
]);
/** Configurações iniciais auditáveis, sem bônus automático ou itens criados.
 * Fonte: Manual consolidado Órion v0.11 · TR-COM-ANI-02 / TR-ESP-ROB-02.
 * Outras Trilhas permanecem bloqueadas até modelarmos suas decisões. */
export const LEVEL2_TRACK_CONFIGS=Object.freeze({
 COM_ANI:Object.freeze({label:'Arma favorita',fields:Object.freeze([{key:'favoriteWeapon',label:'Nome da arma favorita',type:'text',maxLength:80,placeholder:'Ex.: Fuzil de assalto'}]),sourceRef:'TR-COM-ANI-02'}),
 ESP_ROB:Object.freeze({label:'Tipo de Protótipo',requiredSkill:'Tecnologia',fields:Object.freeze([{key:'prototype',label:'Protótipo inicial',type:'select',options:Object.freeze([{value:'protodrones',label:'Protodrones'},{value:'protoarmadura',label:'Protoarmadura'}])}]),sourceRef:'TR-ESP-ROB-02'})
});
function configuredTrack(track){return track.approval==='curated'||Boolean(LEVEL2_TRACK_CONFIGS[track.code]);}
/** Converte a seleção do usuário em valores canônicos curtos e conferidos pelo servidor. */
export function validateTrackConfig(character,track,raw){
 const schema=LEVEL2_TRACK_CONFIGS[track.code];
 if(!schema){if(raw!==undefined&&raw!==null)throw Error('unexpected_track_configuration');return null;}
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).length!==schema.fields.length)throw Error('track_configuration_required');
 if(Object.keys(raw).some(k=>!schema.fields.some(field=>field.key===k)))throw Error('invalid_track_configuration');
 if(schema.requiredSkill&&!isTrained(character,schema.requiredSkill))throw Error('track_skill_required_'+schema.requiredSkill.toLowerCase());
 const result={};
 for(const field of schema.fields){
  const value=raw[field.key];
  if(typeof value!=='string')throw Error('invalid_track_configuration');
  if(field.type==='select'){
   if(!field.options.some(option=>option.value===value))throw Error('invalid_track_configuration');
   result[field.key]=value;
  }else{
   const trimmed=value.trim();
   if(trimmed.length<2||trimmed.length>field.maxLength||/[<>\x00-\x1f\x7f]/.test(trimmed))throw Error('invalid_track_configuration');
   result[field.key]=trimmed;
  }
 }
 return result;
}
export function evaluateTrack(character,track){
 if(!character||typeof character!=='object'||!track||typeof track!=='object')throw Error('invalid_track_evaluation');
 const reasons=[];
 if((character.class_code??character.classCode)!==track.classCode)reasons.push('Trilha pertence a outra classe.');
 if(!configuredTrack(track))reasons.push('Trilha autorizada, mas escolhas secundárias ainda não implementadas.');
 const schema=LEVEL2_TRACK_CONFIGS[track.code];
 if(schema?.requiredSkill&&!isTrained(character,schema.requiredSkill))reasons.push('Requer treinamento em '+schema.requiredSkill+'.');
 const original=reviewTrackPrerequisites(character,track.code,{level:2});
 reasons.push(...original.reasons);
 if(Number(character.level)!==1)reasons.push('A escolha canônica de Trilha ocorre no nível 2.');
 if(String(character.track??'').trim())reasons.push('Personagem já possui Trilha.');
 return {code:track.code,classCode:track.classCode,label:track.label,approval:track.approval,sourceRef:track.sourceRef,
  initialAbility:track.abilities[0],configuration:schema??null,eligible:reasons.length===0,reasons};
}
export function trackCatalog(character){
 const cls=character.class_code??character.classCode;
 return LEVEL2_TRACKS.filter(t=>t.classCode===cls).map(t=>evaluateTrack(character,t));
}
/** Read-only milestone projection; never implies automatic application. */
export function trackProgression(character){
 const classCode=character.class_code??character.classCode;
 const selected=LEVEL2_TRACKS.find(t=>t.code===character.track&&t.classCode===classCode);
 if(!selected)return {selected:null,milestones:[],message:character.track?'Trilha não reconhecida no catálogo vigente; nenhuma habilidade será inferida.':'Trilha ainda não escolhida.'};
 const currentLevel=Number(character.level);
 let known=[];
 try{known=parseList(character.abilities_json??[],'invalid_known_abilities');}catch{return {selected:{code:selected.code,label:selected.label},milestones:[],message:'Registro de habilidades inválido; projeção indisponível.'};}
 const initial=known.find(k=>k&&typeof k==='object'&&normalized(k.code)===normalized(selected.abilities[0].code)&&String(k.source)==='canonical-level-2'&&k.trackCode===selected.code);
 const configuration=initial?.trackConfig&&typeof initial.trackConfig==='object'&&!Array.isArray(initial.trackConfig)?initial.trackConfig:null;
 return {selected:{code:selected.code,label:selected.label,configuration},milestones:selected.abilities.map(a=>{
  const recorded=known.some(k=>k&&typeof k==='object'&&normalized(k.code)===normalized(a.code)&&String(k.source)==='canonical-level-'+a.level);
  return {...a,unlocked:currentLevel>=a.level,recorded,automatic:false,
   status:currentLevel<a.level?'future':recorded?'registered':'not_registered'};
 }),message:'Habilidades registradas são consulta: efeitos e custos de ação dependem de implementação específica. No N8, apenas marcos de Trilhas curadas são certificáveis.'};
}
export const LEVEL2_RITUALS=Object.freeze([
 {code:'cicatrizacao',label:'Cicatrização',circle:1,element:'SANGUE'},
 {code:'decadencia',label:'Decadência',circle:1,element:'MORTE'},
 {code:'eletrocussao',label:'Eletrocussão',circle:1,element:'ENERGIA'},
 {code:'terceiro-olho',label:'Terceiro Olho',circle:1,element:'CONHECIMENTO'},
 {code:'perturbacao',label:'Perturbação',circle:1,element:'CONHECIMENTO'},
]);
/** Poderes básicos sem requisito de atributo, perícia ou configuração no catálogo verificado.
 * Descrições permanecem referenciadas no manual, sem copiar texto protegido.
 * Habilidades que exigem escolha secundária não são habilitadas nesta etapa.
 */
export const LEVEL3_POWERS=Object.freeze([
 {code:'BASE-COM-GOLPE-PESADO',classCode:'COMBATENTE',label:'Golpe Pesado',sourceRef:'Ordem Paranormal RPG 1.3 · p.25, errata v1.3'},
 {code:'BASE-COM-INCANSAVEL',classCode:'COMBATENTE',label:'Incansável',sourceRef:'Ordem Paranormal RPG 1.3 · p.25'},
 {code:'BASE-COM-PRESTEZA-ATLETICA',classCode:'COMBATENTE',label:'Presteza Atlética',sourceRef:'Ordem Paranormal RPG 1.3 · p.25'},
 // PR123: PR-002 converte o pré-requisito original para Nível 6.
 // Em N3 permanece inelegível: reviewPowerPrerequisites impõe minLevel=6.
 {code:'BASE-COM-PROTECAO-PESADA',classCode:'COMBATENTE',label:'Proteção Pesada',sourceRef:'Ordem Paranormal RPG 1.3 · p.25 + PR-002'},
 {code:'BASE-ESP-NA-TRILHA-CERTA',classCode:'ESPECIALISTA',label:'Na Trilha Certa',sourceRef:'Ordem Paranormal RPG 1.3 · p.29'},
 {code:'BASE-ESP-NERD',classCode:'ESPECIALISTA',label:'Nerd',sourceRef:'Ordem Paranormal RPG 1.3 · p.29'},
 {code:'BASE-ESP-PENSAMENTO-AGIL',classCode:'ESPECIALISTA',label:'Pensamento Ágil',sourceRef:'Ordem Paranormal RPG 1.3 · p.30'},
 {code:'BASE-OCU-CAMUFLAR-OCULTISMO',classCode:'OCULTISTA',label:'Camuflar Ocultismo',sourceRef:'Ordem Paranormal RPG 1.3 · p.33'},
 {code:'BASE-OCU-ENVOLTO-MISTERIO',classCode:'OCULTISTA',label:'Envolto em Mistério',sourceRef:'Ordem Paranormal RPG 1.3 · p.33'},
 {code:'BASE-OCU-IDENTIFICACAO-PARANORMAL',classCode:'OCULTISTA',label:'Identificação Paranormal',sourceRef:'Ordem Paranormal RPG 1.3 · p.34'},
 {code:'PO-OCU-003',classCode:'OCULTISTA',label:'Alma Blindada',sourceRef:'Suplemento Órion 1.9.3.1 · PO-OCU-003'},
 {code:'ORION-ESP-ESPECIALIZACAO-ACROBATICA',classCode:'ESPECIALISTA',label:'Especialização Acrobática',sourceRef:'Manual consolidado Órion v0.15 · PO-ESP-003',prerequisites:[{type:'skill',name:'Acrobacia'}]},
 {code:'ORION-ESP-MIRA-INFALIVEL',classCode:'ESPECIALISTA',label:'Mira Infalível',sourceRef:'Manual consolidado Órion v0.15 · PO-ESP-007'},
 ...['COMBATENTE','ESPECIALISTA','OCULTISTA'].map(classCode=>({code:'ORION-GER-BOM-SAMARITANO',classCode,label:'Bom Samaritano',sourceRef:'Manual consolidado Órion v0.15 · PO-GER-005',prerequisites:[{type:'attribute',code:'PRE',min:2}]}))
]);
/**
 * Candidatos de referência, NÃO autorizados para escolha canônica.
 * Mesmo quando o personagem atende ao pré-requisito, aprovação pelo Manual da Rigel
 * é necessária. O catálogo disponível de v0.4.0 segue intacto.
 */
export const POWER_REVIEW_CANDIDATES=Object.freeze([
 {code:'REVIEW-COM-COMBATE-DEFENSIVO',classCode:'COMBATENTE',label:'Combate Defensivo',sourceRef:'Ordem Paranormal RPG 1.3 · p.25',approval:'pending_manual',prerequisites:[{type:'attribute',code:'INT',min:2}]},
 {code:'REVIEW-COM-REFLEXOS-DEFENSIVOS',classCode:'COMBATENTE',label:'Reflexos Defensivos',sourceRef:'Ordem Paranormal RPG 1.3 · p.25',approval:'pending_manual',prerequisites:[{type:'attribute',code:'AGI',min:2}]},
 {code:'REVIEW-COM-GOLPE-DEMOLIDOR',classCode:'COMBATENTE',label:'Golpe Demolidor',sourceRef:'Ordem Paranormal RPG 1.3 · p.25',approval:'pending_manual',prerequisites:[{type:'attribute',code:'FOR',min:2},{type:'skill',name:'Luta'}]},
 {code:'REVIEW-COM-SAQUE-RAPIDO',classCode:'COMBATENTE',label:'Saque Rápido',sourceRef:'Ordem Paranormal RPG 1.3 · p.25',approval:'pending_manual',prerequisites:[{type:'skill',name:'Iniciativa'}]}
]);
function parseList(value,err){
 let result;
 try{result=typeof value==='string'?JSON.parse(value):value;}catch{throw Error(err);}
 if(!Array.isArray(result))throw Error(err);
 return result;
}
function normalized(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();}
function attributeValues(character){
 try{const raw=typeof character.attributes_json==='string'?JSON.parse(character.attributes_json):character.attributes_json;return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};}catch{return {};}
}
/** Fail closed: unspecified or ambiguous skill levels are NOT proof of training. */
function isTrained(character,name){
 // A checagem original isolada ignorava treinamento concedido pela origem.
 // Unificar com a projeção efetiva já validada pelo núcleo de fichas.
 return prerequisiteSkillRank(character,name)>0;
}
/** Machine-readable justification returned to both UI and API. */
export function evaluatePower(character,power){
 if(!character||typeof character!=='object'||!power||typeof power!=='object')throw Error('invalid_power_evaluation');
 const reasons=[];
 const cls=character.class_code??character.classCode;
 if(power.classCode!==cls)reasons.push('Poder pertence a outra classe.');
 if(power.approval==='pending_manual')reasons.push('Aguardando autorização no Manual vigente da Rigel.');
 else if(power.approval&&power.approval!=='curated')reasons.push('Estado de autorização desconhecido.');
 const abilities=parseList(character.abilities_json??[], 'invalid_known_abilities');
 // Referências de planejamento não provam aquisição; só a progressão registrada conta.
 const official=abilities.filter(a=>a&&typeof a==='object'&&isChronologicalGrantSource(a.source,character.level)&&a.source!=='creation-approved');
 if(hasInconsistentCanonicalGrantHistory(character))reasons.push('Registro canônico de habilidade em nível futuro ou inválido requer reconciliação.');
 // Conservar o contrato de erro "power_already_known" para uma entrada
 // canônica do próprio poder mesmo com data futura inconsistente: isso
 // bloqueia uma segunda concessão, sem fingir que a entrada futura é válida.
 const samePower=a=>a&&typeof a==='object'&&
  (normalized(a.code)===normalized(power.code)||normalized(a.name)===normalized(power.label));
 const futureSame=abilities.some(a=>samePower(a)&&
  typeof a.source==='string'&&a.source.startsWith('canonical-level-')&&
  !isChronologicalGrantSource(a.source,character.level));
 if(futureSame||official.some(samePower))reasons.push('O personagem já possui este poder.');
 if(power.approval!=='pending_manual'){
  const original=reviewPowerPrerequisites(character,power.code,{level:Number(character.level)+1});
  reasons.push(...original.reasons);
 }
 const attrs=attributeValues(character);
 for(const pre of power.prerequisites??[]){
  if(pre.type==='attribute'){
   if(!Number.isInteger(attrs[pre.code])||attrs[pre.code]<pre.min)reasons.push(`Requer ${pre.code} ${pre.min} ou mais.`);
  }else if(pre.type==='skill'){
   if(!isTrained(character,pre.name))reasons.push(`Requer treinamento em ${pre.name}.`);
  }else if(pre.type==='power'){
   if(!official.some(a=>normalized(a.code)===normalized(pre.code)))reasons.push(`Requer poder adquirido ${pre.code}.`);
  }else reasons.push('Pré-requisito ainda não implementado.');
 }
 return {code:power.code,label:power.label,sourceRef:power.sourceRef,approval:power.approval??'curated',prerequisites:power.prerequisites??[],eligible:reasons.length===0,reasons};
}
export function powerCatalog(character){
 const cls=character.class_code??character.classCode;
 return [...LEVEL3_POWERS,...POWER_REVIEW_CANDIDATES].filter(p=>p.classCode===cls).map(p=>evaluatePower(character,p));
}
function knownRitual(character,ritual){
 const known=typeof character.rituals_json==='string'?JSON.parse(character.rituals_json):character.rituals_json;
 if(!Array.isArray(known))throw Error('invalid_known_rituals');
 const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return known.some(x=>x&&typeof x==='object'&&(norm(x.code)===norm(ritual.code)||norm(x.stableKey)===norm(ritual.stableKey??ritual.code)||norm(x.name)===norm(ritual.label)));
}
/** Benefícios automáticos N5 confirmados pelo motor original CL-COM/ESP/OCU.
 * Apenas o registro é automático; custos de PE e ações ainda dependem
 * do motor de sessão e não devem ser disparados sem confirmação.
 */
export const LEVEL5_CLASS_GRANTS=Object.freeze({
 COMBATENTE:{code:'CL-COM-N05-ATAQUE-ESPECIAL',label:'Ataque Especial · 3 PE para +10',kind:'class',sourceRef:'CL-COM-001 · Nível 5'},
 ESPECIALISTA:{code:'CL-ESP-N05-PERITO',label:'Perito · 3 PE para +1d8',kind:'class',sourceRef:'CL-ESP-001 · Nível 5'},
 OCULTISTA:{code:'CL-OCU-N05-SEGUNDO-CIRCULO',label:'Escolhido pelo Outro Lado · 2º círculo',kind:'class',sourceRef:'CL-OCU-001 · Nível 5'}
});
/** Melhorias de classe N11 extraídas da progressão original do Projeto Órion.
 * Apenas registro auditado; execução de PE, rolagens e cálculo de bônus
 * continuam fora do motor de ações de sessão.
 */
export const LEVEL11_CLASS_GRANTS=Object.freeze({
 COMBATENTE:{code:'CL-COM-N11-ATAQUE-ESPECIAL',label:'Ataque Especial · 4 PE para +15',kind:'class',sourceRef:'CL-COM-001 · Nível 11',supersedesCode:LEVEL5_CLASS_GRANTS.COMBATENTE.code},
 ESPECIALISTA:{code:'CL-ESP-N11-PERITO',label:'Perito · 4 PE para +1d10',kind:'class',sourceRef:'CL-ESP-001 · Nível 11',supersedesCode:LEVEL5_CLASS_GRANTS.ESPECIALISTA.code},
 OCULTISTA:{code:'CL-OCU-N11-TERCEIRO-CIRCULO',label:'Escolhido pelo Outro Lado · 3º círculo',kind:'class',sourceRef:'CL-OCU-001 · Nível 11',supersedesCode:LEVEL5_CLASS_GRANTS.OCULTISTA.code}
});
/** Não inferir concessões N5 em fichas legadas que não possuem registros.
 * A concessão N11 é uma melhoria: depende do benefício N5 comprovado.
 */
export function level11ClassPlan(character){
 const cls=character?.class_code??character?.classCode, feature=LEVEL11_CLASS_GRANTS[cls], previous=LEVEL5_CLASS_GRANTS[cls];
 if(!feature||!previous)return {eligible:false,reason:'Classe desconhecida.',feature:null};
 let records;
 try{records=parseList(character.abilities_json??[],'invalid_known_abilities');}
 catch{return {eligible:false,reason:'Histórico de habilidades inválido.',feature:null};}
 const hasPrior=records.some(x=>x&&x.code===previous.code&&x.kind==='class'&&x.source==='canonical-level-5');
 if(!hasPrior)return {eligible:false,reason:'A melhoria exige a habilidade N5 oficialmente registrada.',feature};
 const already=records.some(x=>x&&x.code===feature.code&&/^canonical-level-[1-9]\d*$/.test(String(x.source||'')));
 if(already)return {eligible:false,reason:'Melhoria N11 já concedida.',feature};
 return {eligible:true,reason:null,feature};
}
function validateLevel11Advancement(character,payload){
 if(Object.keys(payload).some(k=>!['level','expectedRevision','ritualCode'].includes(k)))throw Error('unexpected_level11_choice');
 const plan=level11ClassPlan(character);
 if(!plan.eligible)throw Error('class_level11_not_verified');
 let ritual=null;
 if(character.class_code==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,11).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!==''){
  throw Error('ritual_only_for_occultist');
 }
 return {level:11,trackCode:null,trackLabel:null,trackAbility:null,trackConfig:null,
  powerCode:null,powerLabel:null,power:null,ritualCode:ritual?.code??null,ritualLabel:ritual?.label??null,ritual,
  classGrant:{...plan.feature},rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}
function ritualCandidatesForLevel(character,target){
 if((character.class_code??character.classCode)!=='OCULTISTA')return [];
 if(target===2||target===3||target===4)return LEVEL2_RITUALS.filter(r=>!knownRitual(character,r));
 if(target>=5&&target<=20){
  let maxCircle=target>=17?4:target>=11?3:2;
  if(target>=18){
   // Nos níveis 18–20 não presumir desbloqueio N17 sem registro do Worker.
   // Rituais de 1º a 3º círculo continuam selecionáveis em N18/N19/N20.
   let owned=[];
   try{owned=parseList(character.abilities_json??[],'invalid_known_abilities');}catch{owned=[];}
   const hasFourth=owned.some(x=>x&&typeof x==='object'&&x.code===LEVEL17_CLASS_GRANTS.OCULTISTA.code&&
    x.kind==='class'&&x.source==='canonical-level-17');
   if(!hasFourth)maxCircle=3;
  }
  return MANUAL_RITUALS.filter(r=>r.circle>=1&&r.circle<=maxCircle)
  .map(r=>({code:r.stableKey,stableKey:r.stableKey,label:r.name,element:r.element,circle:r.circle}))
  .filter(r=>!knownRitual(character,r));
 }
 return [];
}
function validateLevel5Advancement(character,payload){
 if(payload.trackCode!==undefined||payload.trackConfig!==undefined||payload.powerCode!==undefined||
    payload.attributeCode!==undefined||payload.powerConfig!==undefined||payload.trainingSkills!==undefined||
    payload.versatility!==undefined||payload.ritualStableKey!==undefined)
  throw Error('unexpected_level5_choice');
 const cls=character.class_code;
 const feature=LEVEL5_CLASS_GRANTS[cls];
 if(!feature)throw Error('invalid_class');
 const known=parseList(character.abilities_json??[],'invalid_known_abilities');
 if(known.some(x=>x?.source==='canonical-level-5'&&x.code===feature.code))
  throw Error('class_feature_already_acquired');
 let ritual=null;
 if(cls==='OCULTISTA'){
  const choices=ritualCandidatesForLevel(character,5);
  ritual=choices.find(r=>r.code===payload.ritualCode);
  if(!ritual){
    const candidate=MANUAL_RITUALS.find(r=>r.stableKey===payload.ritualCode);
    if(candidate&&knownRitual(character,{code:candidate.stableKey,label:candidate.name}))
     throw Error('ritual_already_known');
    throw Error('ritual_level_or_catalog_invalid');
  }
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!=='')
  throw Error('ritual_only_for_occultist');
 return {level:5,trackCode:null,trackLabel:null,trackAbility:null,trackConfig:null,
  powerCode:null,powerLabel:null,power:null,ritualCode:ritual?.code??null,ritualLabel:ritual?.label??null,
  ritual,classGrant:{...feature},rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}

/** N6 uses only already-curated powers, not the whole 91-power reference catalogue. */
function validateLevel6Advancement(character,payload){
 if(payload.attributeCode!==undefined||payload.trackCode!==undefined||payload.trackConfig!==undefined||
    payload.trainingSkills!==undefined||payload.versatility!==undefined||payload.ritualStableKey!==undefined||
    payload.powerConfig!==undefined)throw Error('unexpected_level6_choice');
 const cls=character.class_code;
 const selected=LEVEL3_POWERS.find(p=>p.classCode===cls&&p.code===payload.powerCode);
 if(!selected)throw Error('invalid_power_for_class');
 const result=evaluatePower(character,selected);
 if(!result.eligible){
  if(result.reasons.includes('O personagem já possui este poder.'))throw Error('power_already_known');
  throw Error('power_prerequisites_not_met');
 }
 let ritual=null;
 if(cls==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,6).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!==''){
  throw Error('ritual_only_for_occultist');
 }
 return {level:6,trackCode:null,trackLabel:null,trackAbility:null,trackConfig:null,
  powerCode:selected.code,powerLabel:selected.label,power:{...selected},
  ritualCode:ritual?.code??null,ritualLabel:ritual?.label??null,ritual,
  rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}

/** N7: training milestone. No power nor track at this level. */
function validateLevel7Advancement(character,payload){
 if(payload.attributeCode!==undefined||payload.trackCode!==undefined||payload.trackConfig!==undefined||
    payload.powerCode!==undefined||payload.powerConfig!==undefined||payload.versatility!==undefined||
    payload.ritualStableKey!==undefined)throw Error('unexpected_level7_choice');
 const training=validateTraining7(character,payload);
 let ritual=null;
 if(character.class_code==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,7).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!==''){
  throw Error('ritual_only_for_occultist');
 }
 return {level:7,trackCode:null,trackLabel:null,trackAbility:null,trackConfig:null,
  powerCode:null,powerLabel:null,power:null,ritualCode:ritual?.code??null,ritualLabel:ritual?.label??null,ritual,
  ...training,rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}

/** N8: unlock recorded track milestone from original source, never infer mechanics.
 * Only a curated N2 track with an official N2 award is eligible. Tracks whose
 * secondary choices are not modeled are blocked rather than silently granted.
 */
export function level8TrackPlan(character){
 const cls=character?.class_code??character?.classCode;
 const selected=LEVEL2_TRACKS.find(t=>t.code===character?.track&&t.classCode===cls);
 if(!selected)return {eligible:false,reason:'Trilha ausente ou não reconhecida no catálogo do Órion.',ability:null};
 if(selected.approval!=='curated')return {eligible:false,reason:'A Trilha exige configuração de N8 ainda não implementada.',trackCode:selected.code,ability:null};
 const sourceCode=selected.code==='COM_CHA'?'COM_CMD':selected.code;
 const verified=TRACK_BY_CODE.get(sourceCode);
 const ability=selected.abilities.find(x=>x.level===8);
 const sourceAbility=verified?.abilities.find(x=>x.level===8);
 if(!ability||!sourceAbility||ability.code!==sourceAbility.code)return {eligible:false,reason:'A habilidade de N8 não coincide com a fonte de regras verificada.',trackCode:selected.code,ability:null};
 let records;try{records=parseList(character.abilities_json??[],'invalid_known_abilities');}catch{return {eligible:false,reason:'Histórico de habilidades inválido.',trackCode:selected.code,ability:null};}
 const first=selected.abilities.find(x=>x.level===2);
 const acquired=records.some(x=>x&&typeof x==='object'&&x.kind==='track'&&x.trackCode===selected.code&&x.code===first?.code&&x.source==='canonical-level-2');
 if(!acquired)return {eligible:false,reason:'A habilidade inicial N2 da Trilha precisa estar registrada pelo Worker.',trackCode:selected.code,ability:null};
 const already=records.some(x=>x&&typeof x==='object'&&x.code===ability.code&&/^canonical-level-[1-9]\d*$/.test(String(x.source||'')));
 if(already)return {eligible:false,reason:'Habilidade de N8 já adquirida.',trackCode:selected.code,ability:null};
 return {eligible:true,reason:null,trackCode:selected.code,ability:{code:ability.code,label:sourceAbility.name,sourceRef:verified.sourceRef,level:8}};
}
function validateLevel8Advancement(character,payload){
 const allowed=['level','expectedRevision','ritualCode'];
 if(Object.keys(payload).some(key=>!allowed.includes(key)))throw Error('unexpected_level8_choice');
 const review=level8TrackPlan(character);
 if(!review.eligible)throw Error('track_level8_not_verified');
 let ritual=null;
 if(character.class_code==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,8).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!==''){
  throw Error('ritual_only_for_occultist');
 }
 return {level:8,trackCode:review.trackCode,trackLabel:null,trackAbility:{...review.ability},
  trackConfig:null,powerCode:null,powerLabel:null,power:null,ritualCode:ritual?.code??null,
  ritualLabel:ritual?.label??null,ritual,
  rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}

/** N13: avanço automático da Trilha principal com fonte N13 certificada.
 * Registro nominal somente: efeitos condicionais e decisões ainda não
 * implementadas ficam no motor de sessão; nenhuma habilidade é inferida
 * para Trilhas pendentes. Exigimos o encadeamento oficial N2 e N8.
 */
export function level13TrackPlan(character){
 const cls=character?.class_code??character?.classCode;
 const selected=LEVEL2_TRACKS.find(t=>t.code===character?.track&&t.classCode===cls);
 if(!selected)return {eligible:false,reason:'Trilha principal ausente ou inválida.',trackCode:null,ability:null};
 if(selected.approval!=='curated')return {eligible:false,reason:'A Trilha exige configuração de N13 ainda não homologada.',trackCode:selected.code,ability:null};
 const sourceCode=selected.code==='COM_CHA'?'COM_CMD':selected.code;
 const verified=TRACK_BY_CODE.get(sourceCode);
 const first=selected.abilities.find(x=>x.level===2);
 const second=selected.abilities.find(x=>x.level===8);
 const third=selected.abilities.find(x=>x.level===13);
 const match=[first,second,third].every(a=>a&&verified?.abilities?.some(b=>b.level===a.level&&b.code===a.code));
 if(!match)return {eligible:false,reason:'Progressão da Trilha N2/N8/N13 não coincide com a fonte verificada.',trackCode:selected.code,ability:null};
 let records;
 try{records=parseList(character.abilities_json??[],'invalid_known_abilities');}
 catch{return {eligible:false,reason:'Histórico de habilidades inválido.',trackCode:selected.code,ability:null};}
 const has=(a,level)=>records.some(x=>x&&typeof x==='object'&&x.kind==='track'&&
   x.trackCode===selected.code&&x.code===a.code&&x.source==='canonical-level-'+level);
 if(!has(first,2)||!has(second,8))
  return {eligible:false,reason:'Exige as habilidades N2 e N8 da Trilha principal oficialmente registradas.',trackCode:selected.code,ability:null};
 const already=records.some(x=>x&&typeof x==='object'&&x.code===third.code&&/^canonical-level-[1-9]\d*$/.test(String(x.source||'')));
 if(already)return {eligible:false,reason:'Habilidade N13 já concedida.',trackCode:selected.code,ability:null};
 const official=verified.abilities.find(a=>a.level===13);
 return {eligible:true,reason:null,trackCode:selected.code,ability:{code:third.code,label:official.name,level:13,sourceRef:verified.sourceRef}};
}
function validateLevel13Advancement(character,payload){
 if(Object.keys(payload).some(k=>!['level','expectedRevision','ritualCode'].includes(k)))
  throw Error('unexpected_level13_choice');
 const plan=level13TrackPlan(character);
 if(!plan.eligible)throw Error('track_level13_not_verified');
 let ritual=null;
 if(character.class_code==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,13).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!==''){
  throw Error('ritual_only_for_occultist');
 }
 return {level:13,trackCode:plan.trackCode,trackLabel:null,trackAbility:{...plan.ability},trackConfig:null,
  powerCode:null,powerLabel:null,power:null,ritualCode:ritual?.code??null,ritualLabel:ritual?.label??null,ritual,
  rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}

/** N20 conclui a Trilha principal já homologada em N2/N8/N13.
 * Exige encadeamento oficial do Worker e paridade estrita com TRACK_BY_CODE
 * para os quatro marcos; habilidades com configuração pendente não são
 * concedidas por suposição. O resultado registra apenas a habilidade nominal.
 */
export function level20TrackPlan(character){
 const cls=character?.class_code??character?.classCode;
 const selected=LEVEL2_TRACKS.find(t=>t.code===character?.track&&t.classCode===cls);
 if(!selected)return {eligible:false,reason:'Trilha principal ausente ou inválida.',trackCode:null,ability:null};
 if(selected.approval!=='curated')
  return {eligible:false,reason:'A Trilha exige configuração de N20 ainda não homologada.',trackCode:selected.code,ability:null};
 const sourceCode=selected.code==='COM_CHA'?'COM_CMD':selected.code;
 const verified=TRACK_BY_CODE.get(sourceCode);
 const levels=[2,8,13,20];
 const local=levels.map(level=>selected.abilities.find(a=>a.level===level));
 const matching=local.every((a,i)=>a&&verified?.abilities?.some(b=>b.level===levels[i]&&b.code===a.code));
 if(!matching)return {eligible:false,reason:'Progressão N2/N8/N13/N20 não coincide com a fonte verificada.',trackCode:selected.code,ability:null};
 let records;
 try{records=parseList(character.abilities_json??[],'invalid_known_abilities');}
 catch{return {eligible:false,reason:'Histórico de habilidades inválido.',trackCode:selected.code,ability:null};}
 const has=(a,level)=>records.some(x=>x&&typeof x==='object'&&!Array.isArray(x)&&
  x.kind==='track'&&x.trackCode===selected.code&&x.code===a.code&&x.source==='canonical-level-'+level);
 if(!levels.slice(0,3).every((level,i)=>has(local[i],level)))
  return {eligible:false,reason:'São necessárias as concessões oficiais N2, N8 e N13 da Trilha principal.',trackCode:selected.code,ability:null};
 const last=local[3];
 if(records.some(x=>x&&typeof x==='object'&&!Array.isArray(x)&&x.code===last.code&&
  /^canonical-level-[1-9]\d*$/.test(String(x.source||''))))
  return {eligible:false,reason:'Habilidade final N20 já concedida.',trackCode:selected.code,ability:null};
 const official=verified.abilities.find(a=>a.level===20);
 return {eligible:true,reason:null,trackCode:selected.code,ability:{
  code:last.code,label:official.name,level:20,sourceRef:verified.sourceRef}};
}
function validateLevel20Advancement(character,payload){
 if(Object.keys(payload).some(k=>!['level','expectedRevision','ritualCode'].includes(k)))
  throw Error('unexpected_level20_choice');
 const plan=level20TrackPlan(character);
 if(!plan.eligible)throw Error('track_level20_not_verified');
 let ritual=null;
 if(character.class_code==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,20).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!=='')
  throw Error('ritual_only_for_occultist');
 return {level:20,trackCode:plan.trackCode,trackLabel:null,trackAbility:{...plan.ability},trackConfig:null,
  powerCode:null,powerLabel:null,power:null,ritualCode:ritual?.code??null,
  ritualLabel:ritual?.label??null,ritual,rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}

/** N14: promoção de Veterano para Expert, sem poder ou Trilha extra. */
function validateLevel14Advancement(character,payload){
 if(Object.keys(payload).some(k=>!['level','expectedRevision','trainingSkills','ritualCode'].includes(k)))
  throw Error('unexpected_level14_choice');
 const training=validateTraining14(character,payload);
 let ritual=null;
 if(character.class_code==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,14).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!==''){
  throw Error('ritual_only_for_occultist');
 }
 return {level:14,trackCode:null,trackLabel:null,trackAbility:null,trackConfig:null,
  powerCode:null,powerLabel:null,power:null,ritualCode:ritual?.code??null,
  ritualLabel:ritual?.label??null,ritual,...training,
  rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}

/** A progressão original CL-ESP-001 prevê Engenhosidade em N8 e
 * melhoria no N15 (+4 PE / +15). O N8 da aplicação ainda não concede
 * a classe automaticamente; N15 registra só a melhoria de N15,
 * sem fabricar um registro retrospectivo do N8.
 */
export const LEVEL15_SPECIALIST_GRANT=Object.freeze({
 code:'CL-ESP-N15-ENGENHOSIDADE',label:'Engenhosidade · +4 PE para +15',
 kind:'class',sourceRef:'CL-ESP-001 · Nível 15'
});
export function level15ClassPlan(character){
 const cls=character?.class_code??character?.classCode;
 if(cls!=='ESPECIALISTA')return {eligible:true,reason:null,feature:null};
 let records;
 try{records=parseList(character.abilities_json??[],'invalid_known_abilities');}
 catch{return {eligible:false,reason:'Histórico de habilidades inválido.',feature:null};}
 const duplicate=records.some(x=>x&&x.code===LEVEL15_SPECIALIST_GRANT.code&&
  /^canonical-level-[1-9]\d*$/.test(String(x.source||'')));
 if(duplicate)return {eligible:false,reason:'Melhoria N15 de Engenhosidade já concedida.',feature:LEVEL15_SPECIALIST_GRANT};
 return {eligible:true,reason:null,feature:LEVEL15_SPECIALIST_GRANT};
}
/** N15: poder curado da própria classe, mais ritual para Ocultista.
 * Especialista também tem melhoria automática de Engenhosidade.
 */
function validateLevel15Advancement(character,payload){
 if(Object.keys(payload).some(k=>!['level','expectedRevision','powerCode','ritualCode'].includes(k)))
  throw Error('unexpected_level15_choice');
 const cls=character.class_code;
 const plan=level15ClassPlan(character);
 if(!plan.eligible)throw Error('class_level15_not_verified');
 const selected=LEVEL3_POWERS.find(p=>p.code===payload.powerCode&&p.classCode===cls);
 if(!selected)throw Error('invalid_power_for_class');
 const evaluated=evaluatePower(character,selected);
 if(!evaluated.eligible){
  if(evaluated.reasons.includes('O personagem já possui este poder.'))throw Error('power_already_known');
  throw Error('power_prerequisites_not_met');
 }
 let ritual=null;
 if(cls==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,15).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!==''){
  throw Error('ritual_only_for_occultist');
 }
 return {level:15,trackCode:null,trackLabel:null,trackAbility:null,trackConfig:null,
  powerCode:selected.code,powerLabel:selected.label,power:{...selected},
  ritualCode:ritual?.code??null,ritualLabel:ritual?.label??null,ritual,
  ...(plan.feature?{classGrant:{...plan.feature}}:{}),
  rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}

/** N16: atributo natural +1 com limite 5, opcional ritual 1–3 para Ocultista.
 * As regras especiais de Maduro e Idoso continuam bloqueadas até homologação;
 * a função de atributo é compartilhada com N4 e N10.
 */
function validateLevel16Advancement(character,payload){
 if(Object.keys(payload).some(k=>!['level','expectedRevision','attributeCode','ritualCode'].includes(k)))
  throw Error('unexpected_level16_choice');
 const attribute=validateAttributeAdvancement(character,{attributeCode:payload.attributeCode});
 let ritual=null;
 if(character.class_code==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,16).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!==''){
  throw Error('ritual_only_for_occultist');
 }
 return {level:16,trackCode:null,trackLabel:null,trackAbility:null,trackConfig:null,
  powerCode:null,powerLabel:null,power:null,ritualCode:ritual?.code??null,ritualLabel:ritual?.label??null,ritual,
  ...attribute,rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}

/** N17: somente melhorias automáticas de classe verificadas, sem escolha
 * adicional para Combatente/Especialista; Ocultista libera o 4º círculo.
 * A trilha histórica N5→N11 da mesma classe deve existir como
 * concessão canônica do Worker, nunca como registro livre.
 */
export const LEVEL17_CLASS_GRANTS=Object.freeze({
 COMBATENTE:Object.freeze({code:'CL-COM-N17-ATAQUE-ESPECIAL',label:'Ataque Especial · 5 PE para +20',
  kind:'class',sourceRef:'CL-COM-001 · Nível 17',supersedesCode:LEVEL11_CLASS_GRANTS.COMBATENTE.code}),
 ESPECIALISTA:Object.freeze({code:'CL-ESP-N17-PERITO',label:'Perito · 5 PE para +1d12',
  kind:'class',sourceRef:'CL-ESP-001 · Nível 17',supersedesCode:LEVEL11_CLASS_GRANTS.ESPECIALISTA.code}),
 OCULTISTA:Object.freeze({code:'CL-OCU-N17-QUARTO-CIRCULO',label:'Escolhido pelo Outro Lado · 4º círculo',
  kind:'class',sourceRef:'CL-OCU-001 · Nível 17',supersedesCode:LEVEL11_CLASS_GRANTS.OCULTISTA.code})
});
export function level17ClassPlan(character){
 const cls=character?.class_code??character?.classCode;
 const feature=LEVEL17_CLASS_GRANTS[cls],n5=LEVEL5_CLASS_GRANTS[cls],n11=LEVEL11_CLASS_GRANTS[cls];
 if(!feature||!n5||!n11)return {eligible:false,reason:'Classe não reconhecida.',feature:null};
 let records;
 try{records=parseList(character.abilities_json??[],'invalid_known_abilities');}
 catch{return {eligible:false,reason:'Histórico de habilidades inválido.',feature};}
 const has=(item,level)=>records.some(x=>x&&typeof x==='object'&&x.code===item.code&&
  x.kind==='class'&&x.source==='canonical-level-'+level);
 if(!has(n5,5)||!has(n11,11))
  return {eligible:false,reason:'É necessário comprovar as concessões oficiais N5 e N11 da classe.',feature};
 if(records.some(x=>x&&typeof x==='object'&&x.code===feature.code&&
   /^canonical-level-[1-9]\d*$/.test(String(x.source||''))))
  return {eligible:false,reason:'A melhoria N17 já foi adquirida.',feature};
 return {eligible:true,reason:null,feature};
}
function validateLevel17Advancement(character,payload){
 if(Object.keys(payload).some(k=>!['level','expectedRevision','ritualCode'].includes(k)))
  throw Error('unexpected_level17_choice');
 const plan=level17ClassPlan(character);
 if(!plan.eligible)throw Error('class_level17_not_verified');
 let ritual=null;
 if(character.class_code==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,17).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!=='')
  throw Error('ritual_only_for_occultist');
 return {level:17,trackCode:null,trackLabel:null,trackAbility:null,trackConfig:null,
  powerCode:null,powerLabel:null,power:null,ritualCode:ritual?.code??null,
  ritualLabel:ritual?.label??null,ritual,
  classGrant:{...plan.feature},rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}

/** N18: poder da própria classe, sem escolher Trilha, atributo ou perícia.
 * Reutiliza os pré-requisitos completos e o catálogo curado dos marcos N12/N15.
 * Para Ocultista, o círculo 4 permanece disponível desde o N17, mas não
 * ocorre nenhum segundo desbloqueio nem nova concessão de classe.
 */
function validateLevel18Advancement(character,payload){
 if(Object.keys(payload).some(k=>!['level','expectedRevision','powerCode','ritualCode'].includes(k)))
  throw Error('unexpected_level18_choice');
 const cls=character.class_code;
 const chosen=LEVEL3_POWERS.find(p=>p.code===payload.powerCode&&p.classCode===cls);
 if(!chosen)throw Error('invalid_power_for_class');
 const evaluated=evaluatePower(character,chosen);
 if(!evaluated.eligible){
  if(evaluated.reasons.includes('O personagem já possui este poder.'))throw Error('power_already_known');
  throw Error('power_prerequisites_not_met');
 }
 let ritual=null;
 if(cls==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,18).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!=='')
  throw Error('ritual_only_for_occultist');
 return {level:18,trackCode:null,trackLabel:null,trackAbility:null,trackConfig:null,
  powerCode:chosen.code,powerLabel:chosen.label,power:{...chosen},
  ritualCode:ritual?.code??null,ritualLabel:ritual?.label??null,ritual,
  rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}

/** N19: +1 atributo natural até 5, sem poder, Trilha ou treinamento.
 * O ritual adicional do Ocultista aceita círculo 4 apenas se o
 * desbloqueio N17 existir como concessão canônica no histórico.
 * As exceções de Maduro/Idoso continuam bloqueadas, como em N4/N10/N16.
 */
function validateLevel19Advancement(character,payload){
 if(Object.keys(payload).some(k=>!['level','expectedRevision','attributeCode','ritualCode'].includes(k)))
  throw Error('unexpected_level19_choice');
 const attribute=validateAttributeAdvancement(character,{attributeCode:payload.attributeCode});
 let ritual=null;
 if(character.class_code==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,19).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!=='')
  throw Error('ritual_only_for_occultist');
 return {level:19,trackCode:null,trackLabel:null,trackAbility:null,trackConfig:null,
  powerCode:null,powerLabel:null,power:null,
  ritualCode:ritual?.code??null,ritualLabel:ritual?.label??null,ritual,
  ...attribute,rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}

/** N9: repeated power milestone, independent from plans and free-text. */
function validateLevel9Advancement(character,payload){
 if(Object.keys(payload).some(k=>!['level','expectedRevision','powerCode','ritualCode'].includes(k)))throw Error('unexpected_level9_choice');
 const cls=character.class_code;
 const chosen=LEVEL3_POWERS.find(p=>p.code===payload.powerCode&&p.classCode===cls);
 if(!chosen)throw Error('invalid_power_for_class');
 const reviewed=evaluatePower(character,chosen);
 if(!reviewed.eligible){
  if(reviewed.reasons.includes('O personagem já possui este poder.'))throw Error('power_already_known');
  throw Error('power_prerequisites_not_met');
 }
 let ritual=null;
 if(cls==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,9).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!==''){
  throw Error('ritual_only_for_occultist');
 }
 return {level:9,trackCode:null,trackLabel:null,trackAbility:null,trackConfig:null,
  powerCode:chosen.code,powerLabel:chosen.label,power:{...chosen},
  ritualCode:ritual?.code??null,ritualLabel:ritual?.label??null,ritual,
  rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}


/** N12 concede um único poder verificado da própria classe, assim como N9.
 * Os requisitos são avaliados sobre a ficha atual do Worker, inclusive
 * aquisições canônicas N3/N6/N9/N10 (Versatilidade).
 * O desbloqueio do 3º círculo permanece válido em N12, não libera o 4º.
 */
function validateLevel12Advancement(character,payload){
 if(Object.keys(payload).some(k=>!['level','expectedRevision','powerCode','ritualCode'].includes(k)))
  throw Error('unexpected_level12_choice');
 const cls=character.class_code;
 const selected=LEVEL3_POWERS.find(p=>p.code===payload.powerCode&&p.classCode===cls);
 if(!selected)throw Error('invalid_power_for_class');
 const reviewed=evaluatePower(character,selected);
 if(!reviewed.eligible){
  if(reviewed.reasons.includes('O personagem já possui este poder.'))throw Error('power_already_known');
  throw Error('power_prerequisites_not_met');
 }
 let ritual=null;
 if(cls==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,12).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!==''){
  throw Error('ritual_only_for_occultist');
 }
 return {level:12,trackCode:null,trackLabel:null,trackAbility:null,trackConfig:null,
  powerCode:selected.code,powerLabel:selected.label,power:{...selected},
  ritualCode:ritual?.code??null,ritualLabel:ritual?.label??null,ritual,
  rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}

/** N10: Versatilidade dá poder da própria classe ou habilidade N2 de
 * OUTRA Trilha da mesma classe. A Trilha principal nunca é substituída.
 */
export function versatilityOptions(character){
 const cls=character.class_code??character.classCode;
 let known=[];try{known=parseList(character.abilities_json??[],'invalid_known_abilities');}catch{return {powers:[],tracks:[]};}
 const powers=powerCatalog(character).filter(x=>x.approval==='curated');
 const tracks=LEVEL2_TRACKS.filter(t=>t.classCode===cls&&t.code!==character.track).map(track=>{
  const source=TRACK_BY_CODE.get(track.code==='COM_CHA'?'COM_CMD':track.code);
  const first=track.abilities.find(a=>a.level===2);
  const approved=configuredTrack(track)&&Boolean(first&&source?.abilities?.some(a=>a.level===2&&a.code===first.code));
  const previous=known.some(a=>a&&typeof a==='object'&&
   (normalized(a.code)===normalized(first?.code)||normalized(a.name)===normalized(first?.label))&&
   (/^canonical-level-[1-9]\d*$/.test(String(a.source||''))||a.source==='creation-approved'));
  const review=reviewTrackPrerequisites(character,track.code,{level:10});
  const reasons=[...review.reasons];
  if(!approved)reasons.push('Habilidade inicial/configuração não certificada.');
  if(previous)reasons.push('Habilidade já adquirida.');
  return {code:track.code,label:track.label,abilityCode:first?.code??null,
   abilityLabel:first?.label??null,sourceRef:source?.sourceRef||track.sourceRef,
   configuration:LEVEL2_TRACK_CONFIGS[track.code]??null,eligible:reasons.length===0,reasons};
 });
 return {powers,tracks};
}
function validateLevel10Advancement(character,payload){
 const allowed=['level','expectedRevision','attributeCode','versatility','ritualCode'];
 if(Object.keys(payload).some(k=>!allowed.includes(k)))throw Error('unexpected_level10_choice');
 const attribute=validateAttributeAdvancement(character,{attributeCode:payload.attributeCode});
 const upgraded={...character,attributes_json:attribute.attributes};
 const slot=payload.versatility;
 if(!slot||typeof slot!=='object'||Array.isArray(slot))throw Error('versatility_required');
 let power=null,ability=null,versatility=null;
 if(slot.kind==='POWER'){
  if(Object.keys(slot).some(k=>!['kind','powerCode'].includes(k)))throw Error('unexpected_versatility_configuration');
  power=LEVEL3_POWERS.find(x=>x.classCode===character.class_code&&x.code===slot.powerCode);
  if(!power)throw Error('invalid_versatility_power');
  const review=evaluatePower(upgraded,power);
  if(!review.eligible)throw Error('versatility_power_prerequisites_not_met');
  versatility={kind:'POWER',powerCode:power.code};
 }else if(slot.kind==='TRACK'){
  if(Object.keys(slot).some(k=>!['kind','trackCode','trackConfig'].includes(k)))throw Error('unexpected_versatility_configuration');
  const track=LEVEL2_TRACKS.find(x=>x.code===slot.trackCode&&x.classCode===character.class_code);
  if(!track||track.code===character.track)throw Error('invalid_versatility_track');
  const available=versatilityOptions(upgraded).tracks.find(x=>x.code===track.code);
  if(!available?.eligible)throw Error('versatility_track_prerequisites_not_met');
  const config=validateTrackConfig(upgraded,track,slot.trackConfig);
  ability={code:available.abilityCode,label:available.abilityLabel,
   sourceRef:available.sourceRef,trackCode:track.code,trackLabel:track.label,trackConfig:config};
  versatility={kind:'TRACK',trackCode:track.code,trackConfig:config};
 }else throw Error('invalid_versatility_kind');
 let ritual=null;
 if(character.class_code==='OCULTISTA'){
  ritual=ritualCandidatesForLevel(character,10).find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('ritual_level_or_catalog_invalid');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!=='')throw Error('ritual_only_for_occultist');
 return {level:10,trackCode:null,trackLabel:null,trackAbility:null,trackConfig:null,
  powerCode:power?.code??null,powerLabel:power?.label??null,power:power?{...power}:null,
  versatility,versatilityAbility:ability,ritualCode:ritual?.code??null,ritualLabel:ritual?.label??null,ritual,
  ...attribute,rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}

export const ADVANCEMENT_ATTRIBUTE_CODES=Object.freeze(['AGI','FOR','INT','PRE','VIG']);
/** N4: um ponto em exatamente um atributo natural, até 5.
 * "Diferentes Estágios da Vida" altera a progressão de Maduro e Idoso;
 * a configuração especial ainda não foi conferida, por isso NÃO a presumimos.
 */
export function validateAttributeAdvancement(character,payload){
 const stage=lifeStageForAge(Number(character.age??18));
 if(stage==='MADURO'||stage==='IDOSO')throw Error('age_attribute_progression_pending');
 const key=payload?.attributeCode;
 if(typeof key!=='string'||!ADVANCEMENT_ATTRIBUTE_CODES.includes(key))throw Error('invalid_attribute_choice');
 if(payload.trackCode!=null&&payload.trackCode!==''||payload.trackConfig!==undefined||
    payload.powerCode!=null&&payload.powerCode!==''||payload.ritualCode!=null&&payload.ritualCode!=='')
   throw Error('unexpected_level4_choice');
 const old=attributeValues(character);
 if(!ADVANCEMENT_ATTRIBUTE_CODES.every(k=>Number.isInteger(old[k])&&old[k]>=0&&old[k]<=5))
   throw Error('invalid_current_attributes');
 if(old[key]>=5)throw Error('attribute_at_natural_limit');
 const prodigy=reviewProdigyAttributeIncrease(character,key);
 if(!prodigy.allowed)throw Error(prodigy.reason);
 const updated={...old,[key]:old[key]+1};
 return {attributeCode:key,attributeBefore:old[key],attributeAfter:updated[key],attributes:updated};
}

export function progressionRoadmap(classCode){
 if(!['COMBATENTE','ESPECIALISTA','OCULTISTA'].includes(classCode))throw Error('invalid_class');
 return Array.from({length:19},(_,i)=>{const level=i+2;return {
   level,emRequired:({2:2,3:5,4:8,5:11,6:14,7:18,8:23,9:28,10:34,11:41,12:48,13:54,14:61,15:67,16:71,17:76,18:81,19:86,20:91})[level],
   choices:classLevelMilestone(classCode,level).choices,
   supported:level>=2&&level<=20
 };});
}
export function progressionOptions(character){
 const cls=character.class_code??character.classCode, next=Number(character.level)+1;
 const ageStage=lifeStageForAge(Number(character.age??18));
 const ageRequiresReview=[4,10,16,19].includes(next)&&['MADURO','IDOSO'].includes(ageStage);
 const naturalAttributes=attributeValues(character);
 return {ruleSet:PROGRESSION_RULESET,nextLevel:next,
  level5Grant:next===5?LEVEL5_CLASS_GRANTS[cls]??null:null,
  level11Grant:next===11?level11ClassPlan(character):null,
  level15Grant:next===15?level15ClassPlan(character):null,
  level17Grant:next===17?level17ClassPlan(character):null,
  trainingChoice:next===7?trainingOptions7(character):next===14?trainingOptions14(character):null,
  trackMilestone:next===8?level8TrackPlan(character):next===13?level13TrackPlan(character):next===20?level20TrackPlan(character):null,
  attributeChoice:[4,10,16,19].includes(next)?{
   available:!ageRequiresReview,
   maxNatural:5,choices:ADVANCEMENT_ATTRIBUTE_CODES.map(code=>{const age=reviewProdigyAttributeIncrease(character,code);
    return {code,current:naturalAttributes[code]??null,
      eligible:Number.isInteger(naturalAttributes[code])&&naturalAttributes[code]<5&&age.allowed,
      ...(age.applies?{ageLimit:age.maximum,ageReason:age.reason}:{} )};}),
   notice:ageRequiresReview?'Maduro e Idoso exigem regras especiais de Aumento de Atributo, ainda em revisão.':null
  }:null,
  versatilityChoice:next===10?versatilityOptions(character):null,
  tracks:next===2?trackCatalog(character).filter(t=>t.eligible):[],
  trackCatalog:next===2?trackCatalog(character):[],
  trackProgression:trackProgression(character),
  blockedTracks:BLOCKED_TRACKS.filter(t=>t.classCode===cls),
  powers:([3,6,9,12,15,18].includes(next))?powerCatalog(character).filter(p=>p.eligible):[],
  powerCatalog:[3,6,9,12,15,18].includes(next)?powerCatalog(character):[],
  rituals:ritualCandidatesForLevel(character,next),
  sourcePrerequisites:originalPrerequisiteCatalog(character,{level:next}),
  roadmap:progressionRoadmap(cls),supported:(next>=2&&next<=20)&&!ageRequiresReview&&(next!==7||trainingOptions7(character).eligible)&&(next!==8||level8TrackPlan(character).eligible)&&(next!==11||level11ClassPlan(character).eligible)&&(next!==13||level13TrackPlan(character).eligible)&&(next!==14||trainingOptions14(character).eligible)&&(next!==15||level15ClassPlan(character).eligible)&&(next!==17||level17ClassPlan(character).eligible)&&(next!==20||level20TrackPlan(character).eligible),
  note:'N20: habilidade final da Trilha principal após comprovar N2/N8/N13. Ocultista aprende ritual inédito de até 4º círculo com desbloqueio N17. Nível máximo atingido após avanço.'};
}
export function validateAdvancement(character,payload){
 if(!character||typeof character!=='object'||!payload||typeof payload!=='object'||Array.isArray(payload))throw Error('invalid_advancement');
 if(!['active','review_required'].includes(character.status))throw Error('character_must_be_active');
 const level=Number(character.level),target=level+1;
 if(level<1||level>19)throw Error('progression_not_supported_yet');
 if(Number(payload.level)!==target)throw Error('invalid_advancement_level');
 const emRequired=target===2?2:target===3?5:target===4?8:target===5?11:target===6?14:target===7?18:target===8?23:target===9?28:target===10?34:target===11?41:target===12?48:target===13?54:target===14?61:target===15?67:target===16?71:target===17?76:target===18?81:target===19?86:91;
 if(!Number.isInteger(Number(character.em))||Number(character.em)<emRequired)throw Error('insufficient_em');
 if(level===1 && String(character.track||'').trim())throw Error('track_already_selected');
 if(level>=2 && !String(character.track||'').trim())throw Error('track_required_before_level3');
 const attrs=typeof character.attributes_json==='string'?JSON.parse(character.attributes_json):character.attributes_json;
 if(level===1&&checkCreationAttributes(attrs).length)throw Error('complete_creation_attributes_first');
 const derived=deriveSheet(character);
 if(!derived.progression.eligible)throw Error('insufficient_em');
 const cls=character.class_code;
 if(target===20)return validateLevel20Advancement(character,payload);
 if(target===19)return validateLevel19Advancement(character,payload);
 if(target===18)return validateLevel18Advancement(character,payload);
 if(target===17)return validateLevel17Advancement(character,payload);
 if(target===16)return validateLevel16Advancement(character,payload);
 if(target===15)return validateLevel15Advancement(character,payload);
 if(target===14)return validateLevel14Advancement(character,payload);
 if(target===13)return validateLevel13Advancement(character,payload);
 if(target===12)return validateLevel12Advancement(character,payload);
 if(target===11)return validateLevel11Advancement(character,payload);
 if(target===10)return validateLevel10Advancement(character,payload);
 if(target===9)return validateLevel9Advancement(character,payload);
 if(target===8)return validateLevel8Advancement(character,payload);
 if(target===7)return validateLevel7Advancement(character,payload);
 if(target===6)return validateLevel6Advancement(character,payload);
 if(target===5)return validateLevel5Advancement(character,payload);
 if(target===4){
  if(Object.keys(payload).some(k=>!['level','expectedRevision','attributeCode','ritualCode'].includes(k)))
   throw Error('unexpected_level4_choice');
  // O marco de N4 concede um ritual ao Ocultista, além de +1 atributo.
  // A validação do atributo ignora a escolha do ritual, cuja permissão
  // é conferida separadamente contra o catálogo e o histórico da ficha.
  const attribute=validateAttributeAdvancement(character,{attributeCode:payload.attributeCode});
  let ritual=null;
  if(cls==='OCULTISTA'){
   ritual=ritualCandidatesForLevel(character,4).find(r=>r.code===payload.ritualCode);
   if(!ritual)throw Error('ritual_level_or_catalog_invalid');
  }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!=='')
   throw Error('ritual_only_for_occultist');
  return {level:target,trackCode:null,trackLabel:null,trackAbility:null,trackConfig:null,
    powerCode:null,powerLabel:null,power:null,
    ritualCode:ritual?.code??null,ritualLabel:ritual?.label??null,ritual,
    ...attribute,rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
 }
 if(payload.attributeCode!==undefined)throw Error('attribute_only_at_attribute_milestone');
 let track=null,power=null,configured=null;
 if(target===2){
  track=LEVEL2_TRACKS.find(t=>t.code===payload.trackCode&&t.classCode===cls);
  if(!track)throw Error('invalid_track_for_class');
  if(!configuredTrack(track))throw Error('track_requires_configuration');
  // A UI é informativa: a aquisição real precisa validar os mesmos
  // requisitos da Trilha no Worker, antes de conceder habilidade e Nível.
  configured=validateTrackConfig(character,track,payload.trackConfig);
  const evaluated=evaluateTrack(character,track);
  if(!evaluated.eligible)throw Error('track_prerequisites_not_met');
  const ability=track.abilities.find(a=>a.level===2);
  if(!ability)throw Error('track_ability_not_verified');
  const known=parseList(character.abilities_json??[],'invalid_known_abilities');
  if(known.some(x=>x&&typeof x==='object'&&(normalized(x.code)===normalized(ability.code)||normalized(x.name)===normalized(ability.label))))throw Error('track_ability_already_known');
  if(payload.powerCode!==undefined&&payload.powerCode!==null&&payload.powerCode!=='')throw Error('power_not_available_at_level2');
 }else{
  if(payload.trackCode!==undefined&&payload.trackCode!==null&&payload.trackCode!=='')throw Error('track_only_on_level2');
  if(payload.trackConfig!==undefined)throw Error('track_config_only_on_level2');
  power=[...LEVEL3_POWERS,...POWER_REVIEW_CANDIDATES].find(p=>p.code===payload.powerCode&&p.classCode===cls);
  if(!power)throw Error('invalid_power_for_class');
  const evaluation=evaluatePower(character,power);
  if(!evaluation.eligible){
   if(evaluation.reasons.includes('O personagem já possui este poder.'))throw Error('power_already_known');
   if(evaluation.approval==='pending_manual')throw Error('power_pending_manual_approval');
   throw Error('power_prerequisites_not_met');
  }
 }
 let ritual=null;
 if(cls==='OCULTISTA'){
  ritual=LEVEL2_RITUALS.find(r=>r.code===payload.ritualCode);
  if(!ritual)throw Error('first_circle_ritual_required');
  if(knownRitual(character,ritual))throw Error('ritual_already_known');
 }else if(payload.ritualCode!==undefined&&payload.ritualCode!==null&&payload.ritualCode!=='')throw Error('ritual_only_for_occultist');
 return {level:target,trackCode:track?.code??null,trackLabel:track?.label??null,
  trackAbility:track?{...track.abilities[0]}:null,
  trackConfig:track?configured:null,
  powerCode:power?.code??null,powerLabel:power?.label??null,power:power?{...power}:null,
  ritualCode:ritual?.code??null,ritualLabel:ritual?.label??null,ritual:ritual?{...ritual}:null,
  rulePack:RULE_PACK.id,ruleSet:PROGRESSION_RULESET};
}
