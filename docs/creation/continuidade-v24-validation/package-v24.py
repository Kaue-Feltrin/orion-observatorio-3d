from pathlib import Path
import shutil,zipfile,hashlib,json
repo=Path(__file__).resolve().parents[3]
app=repo/'orion-observatorio-upload-github-leve'
stage=Path('/workspace/orion-v24-cloudflare-upload')
if stage.exists():shutil.rmtree(stage)
shutil.copytree(app/'dist',stage)
keep={'unborn-v5.png','souls-v9.png','gray-far-v9.png','gray-near-v9.png','red-left-v14.png','red-right-v14.png','black-base-v9.svg','manifest.json'}
for p in (stage/'assets/creation').iterdir():
 if p.name not in keep:p.unlink()
for name in ['classes-v18.png','combatente-v19.png','especialista-v19.png','ocultista-v19.png']:
 p=stage/'assets/workshop'/name
 if p.exists():p.unlink()
(stage/'_headers').write_text('/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n/*.html\n  Cache-Control: no-cache\n/assets/creation/*\n  Cache-Control: public, max-age=0, must-revalidate\n')
(stage/'FONTES-USADAS.txt').write_text('SigilosDeConhecimento.ttf — arquivo fornecido pelo usuário em sigilos_de_conhecimento.zip, incluído sem alteração. Família interna: Sigilos De Conhecimento. O ZIP não continha documento de licença separado; não se atribui licença fictícia ao arquivo.\n')
p=stage/'index.html';p.write_text(p.read_text().replace('<head>',"<head><script>if(!new URLSearchParams(location.search).has('stars')){const u=new URL(location.href);u.searchParams.set('stars','0');history.replaceState(history.state,'',u.href);}</script>",1))
(stage/'LEIA-ME.txt').write_text('''ÓRION — A HISTÓRIA NO PAPEL — V24

Upload manual deste ZIP no Cloudflare Pages, sem comando de build.
index.html está na raiz. Se pedir uma pasta, extraia e envie seu conteúdo.
Nenhum token ou ID de conta Cloudflare é necessário para preparar este ZIP.

Entrada: uma estrela. Cena direta: criacao.html?stars=0&herald=new-herald
Fluxo: estrela → despertar → nome/representação → tábuas/papel → origem → classe
→ atributos → idade/vivência → perícias → habilidades/rituais → equipamento
→ história → conferência → guardar/baixar rascunho.

Introdução pulável na primeira visita da aba; respeita movimento reduzido.
Sigilos com núcleo e halo dourado; vestígios discretos na névoa da identidade.
Mãos com mais presença perto das bordas, preservando imagens, rig e poses.
Tábuas caem sobre a cena viva, assentam e recebem a folha. A mesma mesa acompanha
as decisões, com transições entre capítulos e foco de teclado ao terminar.
WebGL pausa quando o papel cobre a cena e retoma ao voltar à identidade.

66 origens para explorar, filtros, exemplos curtos e comparação de duas origens.
Três classes na roleta; confirmar classe libera Continuar para atributos.
Atributos, idade, treinamentos, rituais e carga usam cópia exata das regras
puras do Órion Fichas em f80bbaacc8acb4ad0158d43fb923e2f421e58528.
24 das 66 origens têm treinamentos mecanicamente verificados nessa base.
Regras de origem/idade ainda incompletas ficam sinalizadas como pendências.
Equipamento é planejamento; poderes condicionais não viram bônus permanentes.

Este protótipo guarda rascunhos locais e exporta JSON. Não cria conta,
não ativa ficha e não grava em D1. Guardar no navegador mantém o rascunho
após fechar a aba; Retomar criação aparece no Observatório. As etapas também
ficam na sessão da aba, quando permitido. Em navegação privada ou com
armazenamento bloqueado, baixe o JSON antes de sair.

Fluidez → Melhor experiência com aceleração gráfica contém orientação.
Se WebGL informar um renderizador de software, o Observatório pode avisar.
Nome genérico Brave não permite confirmar se a aceleração está ativa.
Os endereços internos são copiados para colar na barra do navegador.
O site não consegue ativar a aceleração automaticamente.

Imagens/fontes nativas e perfis de resolução preservados; não houve redução
nova de qualidade para acomodar os efeitos. Validação local em Chrome
SwiftShader não mede o desempenho da GTX 1660. Conferir no seu Brave.

RESULTADOS-V24.md detalha método, testes, evidências e limitações.
Sem deploy, migração remota, merge, nova PR ou mudança no projeto principal.
''')
report=repo/'docs/creation/CONTINUIDADE-RESULTS-V24.md'
if report.exists():shutil.copy2(report,stage/'RESULTADOS-V24.md')
zip_path=repo/'downloads/ORION-SITE-V24.zip';zip_path.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(stage.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(stage))
with zipfile.ZipFile(zip_path) as z:
 assert z.testzip() is None
 assert 'index.html' in z.namelist() and 'criacao.html' in z.namelist()
 assert not any('/node_modules/' in n or n.startswith(('.git/','.env')) for n in z.namelist())
sha=hashlib.sha256(zip_path.read_bytes()).hexdigest();zip_path.with_suffix('.sha256').write_text(sha+'  '+zip_path.name+'\n')
meta={'file':str(zip_path.relative_to(repo)),'bytes':zip_path.stat().st_size,'sha256':sha,'zipCrcVerified':True,'entry':'index.html','protectedSourceCommit':'f80bbaacc8acb4ad0158d43fb923e2f421e58528','deploymentPerformed':False}
(repo/'docs/creation/continuidade-v24-validation/artifact.json').write_text(json.dumps(meta,indent=2)+'\n');print(json.dumps(meta))
