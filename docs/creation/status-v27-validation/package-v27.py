from pathlib import Path
import shutil,zipfile,hashlib,json
repo=Path(__file__).resolve().parents[3]
app=repo/'orion-observatorio-upload-github-leve'
stage=Path('/workspace/orion-v27-cloudflare-upload')
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
(stage/'LEIA-ME.txt').write_text('''ÓRION — FICHA DE STATUS — V27

Upload manual no Cloudflare Pages, sem comando de build. index.html está na raiz.
Não foi executado deploy por esta sessão. O ZIP preserva o fluxo de criação,
o Observatório, o recrutamento e os dados existentes.

Depois de criar ou abrir um personagem, Ver personagem abre a ficha de status.
Corpo inteiro no centro, recursos da sessão e atributos ao redor. A representação
padrão é uma silhueta vetorial provisória; não é um modelo 3D ou rig.
Use Usar imagem de corpo inteiro para escolher PNG/JPEG/WebP de até 6 MiB/16 MP.
A imagem inteira é preservada no navegador, sem edição ou envio remoto.
Ficha em papel mantém a consulta anterior disponível e tem retorno ao status.

Abas: Visão geral, Perícias, Habilidades, Rituais, Inventário e História.
As seções consultam o personagem criado. Busca por finalidade, seleção de item,
ícones e navegação por teclado funcionam. Referências de habilidades e categorias
de catálogo não representam concessão/uso/equipamento ou aprovação canônica.

Vida/Sanidade/Esforço podem ser ajustados em um estado local da sessão, separado
do personagem original. Os máximos são as referências já salvas. Valores ausentes
não são inventados. Não há regras novas de morte, temporários ou condições.

Dados e imagem são locais ao mesmo navegador/domínio. O JSON exportado conserva
a ficha e acrescenta sessionState; a imagem não é incluída no JSON. Importação
pela interface, conta online, D1, Oficina e Evolução não foram implementados nesta
rodada. Não há sincronização automática entre domínios ou aparelhos.

Regras, modelos, mãos, fonte de sigilos, viagens e imagens anteriores preservados.
Novo desenho vetorial de corpo inteiro é original do projeto. Não foram geradas
novas imagens por IA nem adicionadas dependências npm.
RESULTADOS-V27.md registra resultados reais, pesquisa, método e limitações.
''')
report=repo/'docs/creation/STATUS-RESULTS-V27.md'
if report.exists():shutil.copy2(report,stage/'RESULTADOS-V27.md')
zip_path=repo/'downloads/ORION-SITE-V27.zip';zip_path.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(stage.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(stage))
with zipfile.ZipFile(zip_path) as z:
 assert z.testzip() is None
 assert 'index.html' in z.namelist() and 'criacao.html' in z.namelist()
 assert not any('/node_modules/' in n or n.startswith(('.git/','.env')) for n in z.namelist())
sha=hashlib.sha256(zip_path.read_bytes()).hexdigest();zip_path.with_suffix('.sha256').write_text(sha+'  '+zip_path.name+'\n')
meta={'file':str(zip_path.relative_to(repo)),'bytes':zip_path.stat().st_size,'sha256':sha,'zipCrcVerified':True,'entry':'index.html','protectedSourceCommit':'f80bbaacc8acb4ad0158d43fb923e2f421e58528','deploymentPerformed':False}
(repo/'docs/creation/status-v27-validation/artifact.json').write_text(json.dumps(meta,indent=2)+'\n');print(json.dumps(meta))
