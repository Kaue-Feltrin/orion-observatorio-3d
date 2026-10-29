from pathlib import Path
import shutil,zipfile,hashlib,json
repo=Path(__file__).resolve().parents[3]
app=repo/'orion-observatorio-upload-github-leve'
stage=Path('/workspace/orion-v26-cloudflare-upload')
if stage.exists():shutil.rmtree(stage)
shutil.copytree(app/'dist',stage)
keep={'unborn-v5.png','souls-v9.png','gray-far-v9.png','gray-near-v9.png','red-left-v14.png','red-right-v14.png','black-base-v9.svg','manifest.json'}
for p in (stage/'assets/creation').iterdir():
 if p.name not in keep:p.unlink()
for name in ['classes-v18.png','combatente-v19.png','especialista-v19.png','ocultista-v19.png']:
 p=stage/'assets/workshop'/name
 if p.exists():p.unlink()
(stage/'_headers').write_text('/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n/*.html\n  Cache-Control: no-cache\n/assets/creation/*\n  Cache-Control: public, max-age=0, must-revalidate\n')
(stage/'FONTES-USADAS.txt').write_text('SigilosDeConhecimento.ttf — arquivo fornecido pelo usuário em sigilos_de_conhecimento.zip, incluído sem alteração. Família interna: Sigilos De Conhecimento. O ZIP não continha documento de licença separado; não se atribui licença fictícia ao arquivo.\nCaveat — copyright 2014 The Caveat Project Authors; atlas vetorial de escrita derivado da fonte sob SIL OFL 1.1. Licença e atribuição em licenses/Caveat-OFL.txt. Não é geração de imagem por IA.\n')
p=stage/'index.html';p.write_text(p.read_text().replace('<head>',"<head><script>if(!new URLSearchParams(location.search).has('stars')){const u=new URL(location.href);u.searchParams.set('stars','0');history.replaceState(history.state,'',u.href);}</script>",1))
(stage/'LEIA-ME.txt').write_text('''ÓRION — ESCRITA E EQUIPAMENTO — V26

NOVO NESTA VERSÃO
O lápis acompanha a escala da folha e a tinta é revelada nos traços sob a ponta.
A letra é derivada da Caveat (SIL OFL 1.1), com licença em licenses/Caveat-OFL.txt.
Nomes fora do atlas latino conservam seus caracteres com revelação de fallback.

Equipamento mostra vagas por categoria, itens em conflito na mochila e motivos
visíveis. Retirar item corrige a seleção sem mudar automaticamente a patente.
O filtro opcional mostra adições que não excedem os limites atuais. A mochila
com erros continua visível mesmo se o filtro ou a busca esconder o item no catálogo.
Continuar/Criar aguardam a correção dos erros reais do inventário.


Upload manual deste ZIP no Cloudflare Pages, sem comando de build.
index.html está na raiz. Se pedir uma pasta, extraia e envie seu conteúdo.
Não é necessário token ou ID Cloudflare para preparar este arquivo.

Fluxo: despertar → nome/representação → origens → classe → atributos
→ idade/vivência → perícias → habilidades/rituais → equipamento → história
→ conferência → CRIAR PERSONAGEM → ficha de recrutamento → personagem criado.

Compare origens pelos botões Comparar da lista ou do detalhe. Duas vagas mostram
as origens separadas. Abra Comparar origens para ver passado, competências e
habilidade lado a lado, e escolha a origem diretamente nesse quadro.
A rolagem automática é suave, pode ser interrompida e respeita movimento reduzido.
Idade mostra quantidade exigida, efeitos, filtros e escolhas marcadas.
Perícias explicam seu uso e dão um exemplo curto. Todos os itens têm ícone.

Criar personagem salva um registro concluído neste navegador. Depois chega
uma nova folha de recrutamento, a foto 3x4 de uma silhueta preta é colada,
a caneta preenche os dados e o carimbo RECRUTADO encerra a apresentação.
Concluir animação pula a apresentação, preservando o registro já salvo.
Se o salvamento falhar, não há carimbo de sucesso e as escolhas são mantidas.
Recarregar durante a apresentação abre a ficha existente, sem duplicar.

Personagens criados aparecem como estrelas no Observatório. Mais de três
registros usam páginas de estrelas; os anteriores não são apagados.
A ficha pode ser consultada e baixada em JSON. Os registros são individuais,
preservados ao criar outros personagens e separados do progresso incompleto.

IMPORTANTE SOBRE O LOCAL DOS DADOS
Este é o arquivo local da cópia visual, por site e navegador. Não cadastra
numa conta online, não ativa fichas oficiais e não grava em D1.
Outro navegador, aparelho ou domínio não terá automaticamente esses dados.
Baixar a ficha em JSON mantém uma cópia; importação de JSON ainda não foi feita.

Regras: cópia exata de 30 arquivos puros do Órion Fichas em f80bbaacc8acb4ad0158d43fb923e2f421e58528.
As 66 origens podem ser exploradas; 24 possuem treinamentos mecanicamente
verificados nessa base. As escolhas obrigatórias precisam estar completas,
e as pendências de efeitos ainda não homologados continuam registradas.
O carimbo é a conclusão visual do registro local, não uma ativação no Worker.

Arte, fonte, rig, mãos, viagens e resoluções existentes foram preservados.
Novos ícones e objetos da apresentação são vetores de interface.
Movimento reduzido apresenta a folha pronta, sem queda/escrita/carimbo bruscos.
Fluidez continua oferecendo orientação sobre aceleração gráfica.

RESULTADOS-V26.md registra o método, testes, evidências e limitações.
Não foi executado deploy, migração remota, merge, nova PR ou operação de produção.
''')
report=repo/'docs/creation/ESCRITA-RESULTS-V26.md'
if report.exists():shutil.copy2(report,stage/'RESULTADOS-V26.md')
zip_path=repo/'downloads/ORION-SITE-V26.zip';zip_path.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(stage.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(stage))
with zipfile.ZipFile(zip_path) as z:
 assert z.testzip() is None
 assert 'index.html' in z.namelist() and 'criacao.html' in z.namelist()
 assert not any('/node_modules/' in n or n.startswith(('.git/','.env')) for n in z.namelist())
sha=hashlib.sha256(zip_path.read_bytes()).hexdigest();zip_path.with_suffix('.sha256').write_text(sha+'  '+zip_path.name+'\n')
meta={'file':str(zip_path.relative_to(repo)),'bytes':zip_path.stat().st_size,'sha256':sha,'zipCrcVerified':True,'entry':'index.html','protectedSourceCommit':'f80bbaacc8acb4ad0158d43fb923e2f421e58528','deploymentPerformed':False}
(repo/'docs/creation/escrita-v26-validation/artifact.json').write_text(json.dumps(meta,indent=2)+'\n');print(json.dumps(meta))
