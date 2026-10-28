// Read-only snapshot of the existing catalog, not a rule engine or a grant.
// Source: orion-fichas PR179, f80bbaacc8acb4ad0158d43fb923e2f421e58528.
export const CATALOG_PROVENANCE={
  "repository": "Kaue-Feltrin/orion-fichas",
  "commit": "f80bbaacc8acb4ad0158d43fb923e2f421e58528",
  "file": "public/catalog-choices.js",
  "sha256": "d872087576059c5a8276fffcf14a7aaeb70be8e4fe1ae3c94516b335072c9fd4",
  "snapshot": "2026-10-16",
  "canonical": false,
  "completeManualCoverageVerified": false
};
export const ORIGINS=Object.freeze([
  {
    "code": "ACADEMICO",
    "label": "Acadêmico",
    "source": "Livro Base",
    "fixedSkills": [
      "CIENCIAS",
      "INVESTIGACAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Saber é Poder"
  },
  {
    "code": "AGENTE_SAUDE",
    "label": "Agente de Saúde",
    "source": "Livro Base",
    "fixedSkills": [
      "INTUICAO",
      "MEDICINA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Técnica Medicinal"
  },
  {
    "code": "ARTISTA",
    "label": "Artista",
    "source": "Livro Base",
    "fixedSkills": [
      "ARTES",
      "ENGANACAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Magnum Opus"
  },
  {
    "code": "ATLETA",
    "label": "Atleta",
    "source": "Livro Base",
    "fixedSkills": [
      "ACROBACIA",
      "ATLETISMO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "110%"
  },
  {
    "code": "CHEF",
    "label": "Chef",
    "source": "Livro Base",
    "fixedSkills": [
      "FORTITUDE",
      "PROFISSAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": true,
    "powerName": "Prato do Dia"
  },
  {
    "code": "CRIMINOSO",
    "label": "Criminoso",
    "source": "Livro Base",
    "fixedSkills": [
      "CRIME",
      "FURTIVIDADE"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Artifício"
  },
  {
    "code": "CULTISTA_ARREPENDIDO",
    "label": "Cultista Arrependido",
    "source": "Livro Base",
    "fixedSkills": [
      "OCULTISMO",
      "RELIGIAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Traços do Outro Lado"
  },
  {
    "code": "DESGARRADO",
    "label": "Desgarrado",
    "source": "Livro Base",
    "fixedSkills": [
      "FORTITUDE",
      "SOBREVIVENCIA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Calejado"
  },
  {
    "code": "ENGENHEIRO",
    "label": "Engenheiro",
    "source": "Livro Base",
    "fixedSkills": [
      "PROFISSAO",
      "TECNOLOGIA"
    ],
    "variableSkillCount": 0,
    "professionRequired": true,
    "powerName": "Ferramenta Favorita"
  },
  {
    "code": "EXECUTIVO",
    "label": "Executivo",
    "source": "Livro Base",
    "fixedSkills": [
      "DIPLOMACIA",
      "PROFISSAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": true,
    "powerName": "Processo Otimizado"
  },
  {
    "code": "INVESTIGADOR",
    "label": "Investigador",
    "source": "Livro Base",
    "fixedSkills": [
      "INVESTIGACAO",
      "PERCEPCAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Faro para Pistas"
  },
  {
    "code": "LUTADOR",
    "label": "Lutador",
    "source": "Livro Base",
    "fixedSkills": [
      "LUTA",
      "REFLEXOS"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Lutador Exímio"
  },
  {
    "code": "MAGNATA",
    "label": "Magnata",
    "source": "Livro Base",
    "fixedSkills": [
      "DIPLOMACIA",
      "PILOTAGEM"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Ajudante Fiel"
  },
  {
    "code": "MERCENARIO",
    "label": "Mercenário",
    "source": "Livro Base",
    "fixedSkills": [
      "INICIATIVA",
      "INTIMIDACAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Posição de Combate"
  },
  {
    "code": "MILITAR",
    "label": "Militar",
    "source": "Livro Base",
    "fixedSkills": [
      "PONTARIA",
      "TATICA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Em Formação"
  },
  {
    "code": "OPERARIO",
    "label": "Operário",
    "source": "Livro Base",
    "fixedSkills": [
      "FORTITUDE",
      "PROFISSAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": true,
    "powerName": "Ferramenta de Trabalho"
  },
  {
    "code": "POLICIAL",
    "label": "Policial",
    "source": "Livro Base",
    "fixedSkills": [
      "PERCEPCAO",
      "PONTARIA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Patrulha"
  },
  {
    "code": "RELIGIOSO",
    "label": "Religioso",
    "source": "Livro Base",
    "fixedSkills": [
      "RELIGIAO",
      "VONTADE"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Acalentar"
  },
  {
    "code": "SERVIDOR_PUBLICO",
    "label": "Servidor Público",
    "source": "Livro Base",
    "fixedSkills": [
      "INTUICAO",
      "VONTADE"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Espírito Cívico"
  },
  {
    "code": "TEORICO_CONSPIRACAO",
    "label": "Teórico da Conspiração",
    "source": "Livro Base",
    "fixedSkills": [
      "INVESTIGACAO",
      "OCULTISMO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Eu Já Sabia"
  },
  {
    "code": "TI",
    "label": "T.I.",
    "source": "Livro Base",
    "fixedSkills": [
      "INVESTIGACAO",
      "TECNOLOGIA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Motor de Busca"
  },
  {
    "code": "TRABALHADOR_RURAL",
    "label": "Trabalhador Rural",
    "source": "Livro Base",
    "fixedSkills": [
      "ADESTRAMENTO",
      "SOBREVIVENCIA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Desbravador"
  },
  {
    "code": "TRAMBIQUEIRO",
    "label": "Trambiqueiro",
    "source": "Livro Base",
    "fixedSkills": [
      "CRIME",
      "ENGANACAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Impostor"
  },
  {
    "code": "UNIVERSITARIO",
    "label": "Universitário",
    "source": "Livro Base",
    "fixedSkills": [
      "ATUALIDADES",
      "INVESTIGACAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Dedicação"
  },
  {
    "code": "VITIMA",
    "label": "Vítima",
    "source": "Livro Base",
    "fixedSkills": [
      "REFLEXOS",
      "VONTADE"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Cicatrizes Psicológicas"
  },
  {
    "code": "AMIGO_ANIMAIS",
    "label": "Amigo dos Animais",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "ADESTRAMENTO",
      "PERCEPCAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Companheiro Animal"
  },
  {
    "code": "ASTRONAUTA",
    "label": "Astronauta",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "CIENCIAS",
      "FORTITUDE"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Acostumado ao Extremo"
  },
  {
    "code": "CHEF_OUTRO_LADO",
    "label": "Chef do Outro Lado",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "OCULTISMO",
      "PROFISSAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": true,
    "powerName": "Fome do Outro Lado"
  },
  {
    "code": "COLEGIAL",
    "label": "Colegial",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "ATUALIDADES",
      "TECNOLOGIA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Poder da Amizade"
  },
  {
    "code": "COSPLAYER",
    "label": "Cosplayer",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "ARTES",
      "VONTADE"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Não é fantasia, é cosplay!"
  },
  {
    "code": "DIPLOMATA",
    "label": "Diplomata",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "ATUALIDADES",
      "DIPLOMACIA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Conexões"
  },
  {
    "code": "EXPLORADOR",
    "label": "Explorador",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "FORTITUDE",
      "SOBREVIVENCIA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Manual do Sobrevivente"
  },
  {
    "code": "EXPERIMENTO",
    "label": "Experimento",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "ATLETISMO",
      "FORTITUDE"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Mutação"
  },
  {
    "code": "FANATICO_CRIATURAS",
    "label": "Fanático por Criaturas",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "INVESTIGACAO",
      "OCULTISMO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Conhecimento Oculto"
  },
  {
    "code": "FOTOGRAFO",
    "label": "Fotógrafo",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "ARTES",
      "PERCEPCAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Através da Lente"
  },
  {
    "code": "INVENTOR_PARANORMAL",
    "label": "Inventor Paranormal",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "PROFISSAO",
      "VONTADE"
    ],
    "variableSkillCount": 0,
    "professionRequired": true,
    "powerName": "Invenção Paranormal"
  },
  {
    "code": "JOVEM_MISTICO",
    "label": "Jovem Místico",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "OCULTISMO",
      "RELIGIAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "A Culpa é das Estrelas"
  },
  {
    "code": "LEGISTA_NOTURNO",
    "label": "Legista do Turno da Noite",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "CIENCIAS",
      "MEDICINA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Luto Habitual"
  },
  {
    "code": "MATEIRO",
    "label": "Mateiro",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "PERCEPCAO",
      "SOBREVIVENCIA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Mapa Celeste"
  },
  {
    "code": "MERGULHADOR",
    "label": "Mergulhador",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "ATLETISMO",
      "FORTITUDE"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Fôlego de Nadador"
  },
  {
    "code": "MOTORISTA",
    "label": "Motorista",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "PILOTAGEM",
      "REFLEXOS"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Mãos no Volante"
  },
  {
    "code": "NERD_ENTUSIASTA",
    "label": "Nerd Entusiasta",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "CIENCIAS",
      "TECNOLOGIA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "O Inteligentão"
  },
  {
    "code": "PSICOLOGO",
    "label": "Psicólogo",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "INTUICAO",
      "PROFISSAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": true,
    "powerName": "Terapia"
  },
  {
    "code": "REPORTER_INVESTIGATIVO",
    "label": "Repórter Investigativo",
    "source": "Sobrevivendo ao Horror",
    "fixedSkills": [
      "ATUALIDADES",
      "INVESTIGACAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Encontrar a Verdade"
  },
  {
    "code": "ACALENTADOR",
    "label": "Acalentador",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "DIPLOMACIA",
      "INTUICAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Apoio Emocional"
  },
  {
    "code": "ALFAIATE",
    "label": "Alfaiate",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "ARTES",
      "PROFISSAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": true,
    "powerName": "Fada Madrinha"
  },
  {
    "code": "APOSTADOR",
    "label": "Apostador",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "CRIME",
      "ENGANACAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Carta na Manga"
  },
  {
    "code": "ATIRADOR_EXIMIO",
    "label": "Atirador Exímio",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "PERCEPCAO",
      "PONTARIA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Precisão Mortal"
  },
  {
    "code": "BOMBADO",
    "label": "Bombado",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "ATLETISMO",
      "FORTITUDE"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "AESTHETIC!"
  },
  {
    "code": "BOTICARIO",
    "label": "Boticário",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "CIENCIAS",
      "MEDICINA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Medicina Amarga"
  },
  {
    "code": "COLECIONADOR",
    "label": "Colecionador",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "OCULTISMO",
      "SOBREVIVENCIA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Recompensa de Espólios"
  },
  {
    "code": "CRIANCA_AMALDICOADA",
    "label": "Criança Amaldiçoada",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "OCULTISMO",
      "VONTADE"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Feito de Medo"
  },
  {
    "code": "DESOCUPADO",
    "label": "Desocupado",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "ATUALIDADES"
    ],
    "variableSkillCount": 1,
    "professionRequired": false,
    "powerName": "Conhecimento Específico"
  },
  {
    "code": "HERDEIRO",
    "label": "Herdeiro",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "ATUALIDADES",
      "OCULTISMO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Herança"
  },
  {
    "code": "INVENTOR",
    "label": "Inventor",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "INTUICAO",
      "PROFISSAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": true,
    "powerName": "Gambiarra Aprimorada"
  },
  {
    "code": "LINHA_FRENTE",
    "label": "Linha de Frente",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "FORTITUDE",
      "LUTA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "O Tanque"
  },
  {
    "code": "MOCHILEIRO_ORIGEM",
    "label": "Mochileiro",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "DIPLOMACIA",
      "SOBREVIVENCIA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Bom Mochileiro"
  },
  {
    "code": "PLAYER",
    "label": "Player",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "REFLEXOS",
      "TECNOLOGIA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Easter Egg"
  },
  {
    "code": "PROFETA",
    "label": "Profeta",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "INTUICAO",
      "RELIGIAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Voz do Além"
  },
  {
    "code": "REVOLUCIONARIO",
    "label": "Revolucionário",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "DIPLOMACIA",
      "INTIMIDACAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Contra à Opressão"
  },
  {
    "code": "VETERINARIO",
    "label": "Veterinário",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "ADESTRAMENTO",
      "MEDICINA"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Animalis"
  },
  {
    "code": "BODYBUILDER",
    "label": "Bodybuilder",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "ATLETISMO",
      "FORTITUDE"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Saindo da Jaula"
  },
  {
    "code": "BLASTER",
    "label": "Blaster",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "CIENCIAS",
      "PROFISSAO"
    ],
    "variableSkillCount": 0,
    "professionRequired": true,
    "powerName": "Explosão Solidária"
  },
  {
    "code": "PERSONAL_TRAINER",
    "label": "Personal Trainer",
    "source": "Suplemento Órion",
    "fixedSkills": [
      "ATLETISMO",
      "CIENCIAS"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Todo Mundo Pagando 10"
  },
  {
    "code": "EXORCIZADO",
    "label": "Exorcizado",
    "source": "Arquivos Secretos #7",
    "fixedSkills": [
      "FORTITUDE",
      "OCULTISMO"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "O Que Restou"
  },
  {
    "code": "SENSITIVO_REBELDE",
    "label": "Sensitivo Rebelde",
    "source": "Arquivos Secretos #7",
    "fixedSkills": [
      "INTUICAO",
      "VONTADE"
    ],
    "variableSkillCount": 0,
    "professionRequired": false,
    "powerName": "Sussurros e Vultos"
  }
].map(o=>Object.freeze({...o,fixedSkills:Object.freeze(o.fixedSkills)})));
export const SKILLS=Object.freeze([
  {
    "code": "ACROBACIA",
    "label": "Acrobacia",
    "attribute": "AGI",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "ADESTRAMENTO",
    "label": "Adestramento",
    "attribute": "PRE",
    "trainedOnly": true,
    "usesKit": false
  },
  {
    "code": "ARTES",
    "label": "Artes",
    "attribute": "PRE",
    "trainedOnly": true,
    "usesKit": false
  },
  {
    "code": "ATLETISMO",
    "label": "Atletismo",
    "attribute": "FOR",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "ATUALIDADES",
    "label": "Atualidades",
    "attribute": "INT",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "CIENCIAS",
    "label": "Ciências",
    "attribute": "INT",
    "trainedOnly": true,
    "usesKit": false
  },
  {
    "code": "CRIME",
    "label": "Crime",
    "attribute": "AGI",
    "trainedOnly": true,
    "usesKit": true
  },
  {
    "code": "DIPLOMACIA",
    "label": "Diplomacia",
    "attribute": "PRE",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "ENGANACAO",
    "label": "Enganação",
    "attribute": "PRE",
    "trainedOnly": false,
    "usesKit": true
  },
  {
    "code": "FORTITUDE",
    "label": "Fortitude",
    "attribute": "VIG",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "FURTIVIDADE",
    "label": "Furtividade",
    "attribute": "AGI",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "INICIATIVA",
    "label": "Iniciativa",
    "attribute": "AGI",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "INTIMIDACAO",
    "label": "Intimidação",
    "attribute": "PRE",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "INTUICAO",
    "label": "Intuição",
    "attribute": "PRE",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "INVESTIGACAO",
    "label": "Investigação",
    "attribute": "INT",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "LUTA",
    "label": "Luta",
    "attribute": "FOR",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "MEDICINA",
    "label": "Medicina",
    "attribute": "INT",
    "trainedOnly": false,
    "usesKit": true
  },
  {
    "code": "OCULTISMO",
    "label": "Ocultismo",
    "attribute": "INT",
    "trainedOnly": true,
    "usesKit": false
  },
  {
    "code": "PERCEPCAO",
    "label": "Percepção",
    "attribute": "PRE",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "PILOTAGEM",
    "label": "Pilotagem",
    "attribute": "AGI",
    "trainedOnly": true,
    "usesKit": false
  },
  {
    "code": "PONTARIA",
    "label": "Pontaria",
    "attribute": "AGI",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "PROFISSAO",
    "label": "Profissão",
    "attribute": "INT",
    "trainedOnly": true,
    "usesKit": false
  },
  {
    "code": "REFLEXOS",
    "label": "Reflexos",
    "attribute": "AGI",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "RELIGIAO",
    "label": "Religião",
    "attribute": "PRE",
    "trainedOnly": true,
    "usesKit": false
  },
  {
    "code": "SOBREVIVENCIA",
    "label": "Sobrevivência",
    "attribute": "INT",
    "trainedOnly": false,
    "usesKit": false
  },
  {
    "code": "TATICA",
    "label": "Tática",
    "attribute": "INT",
    "trainedOnly": true,
    "usesKit": false
  },
  {
    "code": "TECNOLOGIA",
    "label": "Tecnologia",
    "attribute": "INT",
    "trainedOnly": true,
    "usesKit": true
  },
  {
    "code": "VONTADE",
    "label": "Vontade",
    "attribute": "PRE",
    "trainedOnly": false,
    "usesKit": false
  }
].map(Object.freeze));
