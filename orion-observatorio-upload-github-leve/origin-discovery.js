import {ORIGINS,SKILLS} from './origin-catalog.js';

// Discovery tags describe catalog skills, never class locks or extra benefits.
export const INTERESTS=Object.freeze([
 {id:'investigar',label:'Investigar',prompt:'Quero descobrir o que está escondido.',skills:['INVESTIGACAO','PERCEPCAO','CIENCIAS','ATUALIDADES']},
 {id:'cuidar',label:'Cuidar',prompt:'Quero cuidar de pessoas ou animais.',skills:['MEDICINA','ADESTRAMENTO','INTUICAO']},
 {id:'criar',label:'Criar e consertar',prompt:'Quero criar, consertar ou entender máquinas.',skills:['TECNOLOGIA','PROFISSAO','ARTES']},
 {id:'convencer',label:'Convencer',prompt:'Quero lidar com pessoas e influenciar decisões.',skills:['DIPLOMACIA','ENGANACAO','INTIMIDACAO']},
 {id:'sobreviver',label:'Sobreviver',prompt:'Quero explorar e me virar em lugares difíceis.',skills:['SOBREVIVENCIA','FORTITUDE','PILOTAGEM']},
 {id:'agir',label:'Agir sob pressão',prompt:'Quero uma história ligada à ação e ao esforço físico.',skills:['LUTA','PONTARIA','ATLETISMO','REFLEXOS','INICIATIVA']},
 {id:'paranormal',label:'Paranormal',prompt:'Quero um passado próximo do inexplicável.',skills:['OCULTISMO','RELIGIAO']},
 {id:'discricao',label:'Agir com discrição',prompt:'Quero alguém que saiba agir sem chamar atenção.',skills:['CRIME','FURTIVIDADE']}
].map(i=>Object.freeze({...i,skills:Object.freeze(i.skills)})));
const summaries={
 ACADEMICO:'Uma vida entre estudos, perguntas e conhecimento. Nem toda resposta estava nos livros.',
 AGENTE_SAUDE:'Cuidar de pessoas fazia parte da sua rotina, muito antes do inexplicável.',
 ARTISTA:'Você encontrava na arte uma forma de dizer o que palavras comuns não alcançavam.',
 ATLETA:'Treino, disciplina e movimento marcaram sua vida.',
 CHEF:'Sua história passava pela cozinha, pelos sabores e pelas pessoas ao redor da mesa.',
 CRIMINOSO:'Você conheceu caminhos que as pessoas preferem não mencionar.',
 CULTISTA_ARREPENDIDO:'Seu passado se aproximou de uma crença que você decidiu abandonar.',
 DESGARRADO:'Você aprendeu a seguir em frente mesmo sem um lugar ao qual pertencer.',
 ENGENHEIRO:'Entender como as coisas funcionam sempre foi parte da sua maneira de ver o mundo.',
 EXECUTIVO:'Decisões, negociações e responsabilidades preenchiam seus dias.',
 INVESTIGADOR:'Você aprendeu a procurar pistas onde outras pessoas só viam detalhes.',
 LUTADOR:'Seu corpo, seu treino e sua determinação contam parte da sua história.',
 MAGNATA:'Dinheiro, influência e os círculos que os acompanham fizeram parte da sua vida.',
 MERCENARIO:'Você já esteve em situações perigosas em troca de pagamento.',
 MILITAR:'Disciplina e treinamento militar deixaram marcas no seu passado.',
 OPERARIO:'Seu conhecimento nasceu do trabalho e da prática cotidiana.',
 POLICIAL:'Sua rotina envolvia ocorrências, investigação e a vida nas ruas.',
 RELIGIOSO:'A fé foi uma presença importante na sua trajetória.',
 SERVIDOR_PUBLICO:'Você conheceu o trabalho diário de atender pessoas e fazer instituições funcionarem.',
 TEORICO_CONSPIRACAO:'Você suspeitava que havia algo por trás das versões oficiais.',
 TI:'Computadores, sistemas e informação faziam parte do seu cotidiano.',
 TRABALHADOR_RURAL:'Sua vida estava ligada à terra, aos animais e aos ritmos do campo.',
 TRAMBIQUEIRO:'Você aprendeu a sair de situações difíceis com conversa e esperteza.',
 UNIVERSITARIO:'Estudos, descobertas e uma vida ainda em construção compunham sua rotina.',
 VITIMA:'Algo que você viveu deixou marcas. Sua história continua para além delas.',
 AMIGO_ANIMAIS:'Sua relação com os animais sempre teve um lugar especial na sua vida.',
 ASTRONAUTA:'Você construiu uma trajetória ligada ao espaço e aos seus desafios.',
 CHEF_OUTRO_LADO:'A cozinha e o inexplicável se encontram na ideia desse passado.',
 COLEGIAL:'Sua história começou entre aulas, amizades e descobertas da vida escolar.',
 COSPLAYER:'Criar e interpretar outras figuras era uma forma de expressão para você.',
 DIPLOMATA:'Sua experiência passava por diálogo, negociações e relações entre pessoas.',
 EXPLORADOR:'Lugares desconhecidos e a vontade de descobrir marcaram sua trajetória.',
 EXPERIMENTO:'Uma experiência incomum faz parte da história que você quer contar.',
 FANATICO_CRIATURAS:'O interesse por criaturas e pelo desconhecido ocupava seus pensamentos.',
 FOTOGRAFO:'Você aprendeu a perceber o mundo por meio de enquadramentos e imagens.',
 INVENTOR_PARANORMAL:'Criar coisas e se aproximar do inexplicável se cruzam no seu passado.',
 JOVEM_MISTICO:'Crenças e sinais incomuns acompanharam suas primeiras descobertas.',
 LEGISTA_NOTURNO:'Seu trabalho passava por perguntas que os mortos deixavam para os vivos.',
 MATEIRO:'Você se acostumou a observar caminhos, rastros e a vida fora das cidades.',
 MERGULHADOR:'Seu passado está ligado às profundezas e à experiência de mergulhar.',
 MOTORISTA:'Estradas, trajetos e o tempo ao volante fizeram parte da sua rotina.',
 NERD_ENTUSIASTA:'Seus interesses renderam horas de estudo, curiosidade e dedicação.',
 PSICOLOGO:'Ouvir pessoas e buscar compreender suas experiências marcou sua vida.',
 REPORTER_INVESTIGATIVO:'Você buscava histórias, fontes e os fatos por trás das aparências.',
 ACALENTADOR:'Acolher pessoas e estar presente para elas era parte da sua história.',
 ALFAIATE:'Seu trabalho transformava tecido, medidas e ideias em vestimentas.',
 APOSTADOR:'Jogos, apostas e decisões arriscadas atravessaram seu passado.',
 ATIRADOR_EXIMIO:'Precisão e treinamento de tiro fazem parte da história que você quer contar.',
 BOMBADO:'A dedicação ao treino físico deixou marcas na sua rotina.',
 BOTICARIO:'Preparos, ingredientes e cuidados faziam parte do seu conhecimento.',
 COLECIONADOR:'Você reunia objetos e histórias que tinham um significado particular.',
 CRIANCA_AMALDICOADA:'Um passado de infância atravessado pelo inexplicável compõe essa ideia de história.',
 DESOCUPADO:'Sua trajetória não cabe facilmente em uma profissão ou rotina definida.',
 HERDEIRO:'O que veio antes de você deixou uma herança na sua história.',
 INVENTOR:'Você procurava soluções e gostava de transformar ideias em coisas.',
 LINHA_FRENTE:'Estar perto do perigo faz parte da história que você quer contar.',
 MOCHILEIRO_ORIGEM:'Viagens, encontros e caminhos abertos marcaram sua vida.',
 PLAYER:'Jogos e suas descobertas fazem parte dos seus interesses.',
 PROFETA:'Sua história se aproxima da fé e de sinais difíceis de explicar.',
 REVOLUCIONARIO:'Mudar a realidade ao seu redor era uma motivação importante para você.',
 VETERINARIO:'Cuidar da saúde dos animais fazia parte da sua vida.',
 BODYBUILDER:'Construir o próprio corpo era um projeto feito de rotina e dedicação.',
 BLASTER:'Seu interesse por explosivos faz parte da ideia desse passado.',
 PERSONAL_TRAINER:'Você ajudava outras pessoas a desenvolver o corpo por meio do treino.',
 EXORCIZADO:'Um exorcismo atravessa a história que você quer contar.',
 SENSITIVO_REBELDE:'Percepções incomuns e uma postura de questionamento atravessam essa ideia de passado.'
};
const aliases={AGENTE_SAUDE:'médico médica enfermeiro enfermeira hospital',TI:'computador informática hacker programador programação',RELIGIOSO:'padre pastor freira igreja',OPERARIO:'fábrica construção trabalhador',INVESTIGADOR:'detetive pistas mistério',TRABALHADOR_RURAL:'fazenda campo agricultor',ACALENTADOR:'acolhimento apoio',VETERINARIO:'bicho pet animal',BOTICARIO:'remédio farmácia',PERSONAL_TRAINER:'academia exercício'};
export function normalize(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g,' ').trim();}
export function skillLabel(code){return SKILLS.find(s=>s.code===code)?.label??code;}
export function storyFor(origin){return summaries[origin.code]??'Escolha esta origem para explorar uma possibilidade para o seu passado.';}
export function interestsFor(origin){return INTERESTS.filter(i=>origin.fixedSkills.some(s=>i.skills.includes(s)));}
export function findOrigins({query='',interest='',source='',skill=''}={}){
 const tokens=normalize(query).split(' ').filter(Boolean);
 return ORIGINS.filter(o=>{
  const haystack=normalize([o.label,o.powerName,o.source,storyFor(o),aliases[o.code]??'',...o.fixedSkills.map(skillLabel)].join(' '));
  return (!source||o.source===source)&&(!skill||o.fixedSkills.includes(skill))&&(!interest||interestsFor(o).some(i=>i.id===interest))&&tokens.every(t=>haystack.includes(t));
 }).sort((a,b)=>a.label.localeCompare(b.label,'pt-BR'));
}
