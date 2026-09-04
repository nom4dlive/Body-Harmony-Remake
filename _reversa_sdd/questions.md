# Perguntas para Validação — Body-Harmony-Remake

> Gerado pelo Revisor em 2026-06-02
> Responda cada pergunta e me avise quando terminar.

---

## Pergunta 1

**Contexto:** Módulo `conteudo` — upload de foto de mentor em `ContentController.php`
**Spec afetada:** [`_reversa_sdd/conteudo/requirements.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/conteudo/requirements.md)
**Pergunta:** O upload de foto do mentor é armazenado localmente (filesystem) ou em CDN/serviço externo (Cloudinary, S3)?
**Impacto:** Afeta a implementação do storage e a configuração de ambiente necessária.

**Resposta:** O upload deve ser feito no banco de dados da VPS, assim como todas as mídias.

---

## Pergunta 2

**Contexto:** Módulo `conteudo` — validação de upload
**Spec afetada:** [`_reversa_sdd/conteudo/requirements.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/conteudo/requirements.md)
**Pergunta:** Quais MIME types são permitidos no upload de fotos? Existe limite de tamanho (MAX_UPLOAD_SIZE)?
**Impacto:** Define as regras de validação de segurança no upload.

**Resposta:** Atualmente não existe limite. Seria interessante implementar o limite de 2MB e os tipos JPEG, PNG

---

## Pergunta 3

**Contexto:** Módulo `midia` — configurações de upload
**Spec afetada:** [`_reversa_sdd/midia/requirements.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/midia/requirements.md)
**Pergunta:** Qual é o MIME type whitelist e o MAX_UPLOAD_SIZE configurado no MediaController?
**Impacto:** Define as regras de validação para o gerenciador de mídia.

**Resposta:** mp3, mp4, pdf, MAX_UPLOAD_SIZE = 1000 MB

---

## Pergunta 4

**Contexto:** Módulo `midia` — armazenamento de arquivos
**Spec afetada:** [`_reversa_sdd/midia/design.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/midia/design.md)
**Pergunta:** O diretório de armazenamento dos arquivos de mídia é configurável? Fica no filesystem local ou em storage externo?
**Impacto:** Afeta deploy, backup e escalabilidade.

**Resposta:** O diretório ficará na VPS, assim como todas as mídias e arquivos de conteúdo.

---

## Pergunta 5

**Contexto:** Módulo `certificado` — re-emissão
**Spec afetada:** [`_reversa_sdd/certificado/requirements.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/certificado/requirements.md)
**Pergunta:** Uma licenciada pode gerar o certificado do mesmo módulo mais de uma vez? Se sim, o hash é diferente a cada emissão?
**Impacto:** Define a lógica de unicidade de certificados e o comportamento em caso de perda do arquivo PDF.

**Resposta:** Não, apenas uma vez.

---

## Pergunta 6

**Contexto:** Módulo `certificado` — template do PDF
**Spec afetada:** [`_reversa_sdd/certificado/design.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/certificado/design.md)
**Pergunta:** O layout do certificado (template) está definido em qual arquivo? Usa mPDF diretamente ou SimplePDF como wrapper?
**Impacto:** Necessário para implementar a geração do PDF corretamente.

**Resposta:** Honestamente, não sei. O que podemos fazer para verificar a arquitetura do mesmo?

---

## Pergunta 7

**Contexto:** Módulo `certificado` — validação pública
**Spec afetada:** [`_reversa_sdd/certificado/design.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/certificado/design.md)
**Pergunta:** Existe um endpoint público para validar a autenticidade do certificado pelo hash_code?
**Impacto:** Funcionalidade de verificação de autenticidade para terceiros.

**Resposta:** Honestamente, não sei. O que podemos fazer para verificar?

---

## Pergunta 8

**Contexto:** Módulo `broadcast` — broadcasts bloqueantes
**Spec afetada:** [`_reversa_sdd/broadcast/requirements.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/broadcast/requirements.md)
**Pergunta:** Como funciona o bloqueio de fluxo para broadcasts com is_blocking=1? O usuário fica impedido de navegar até fazer acknowledge?
**Impacto:** Define a experiência do usuário e a implementação do mecanismo de blocking.

**Resposta:** O usuário fica impedido de navegar até fazer acknowledge.

---

## Pergunta 9

**Contexto:** Módulo `broadcast` — expiração
**Spec afetada:** [`_reversa_sdd/broadcast/requirements.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/broadcast/requirements.md)
**Pergunta:** Broadcasts têm expiração automática ou expiram apenas quando admin define is_active=0?
**Impacto:** Comportamento de limpeza automática de comunicados antigos.

**Resposta:** Broadcasts têm expiração automática de 7 dias.

---

## Pergunta 10

**Contexto:** Módulo `workshop` — CTA
**Spec afetada:** [`_reversa_sdd/workshop/design.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/workshop/design.md)
**Pergunta:** Qual é a URL de destino do CTA do Workshop (página de inscrição/compra)?
**Impacto:** Link funcional na landing page.

**Resposta:** https://kiwify.app/0VDhCgn

---

## Pergunta 11

**Contexto:** Módulo `resultados` — upload de imagens
**Spec afetada:** [`_reversa_sdd/resultados/requirements.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/resultados/requirements.md)
**Pergunta:** As imagens de resultados (before/after) são URLs externas fornecidas pelo admin ou upload local para o MediaController?
**Impacto:** Integração entre ResultController e MediaController.

**Resposta:** Upload local para o MediaController

---

## Pergunta 12

**Contexto:** Módulo `nexus` — forense batch
**Spec afetada:** [`_reversa_sdd/nexus/design.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/nexus/design.md)
**Pergunta:** Existe rate limiting na geração batch de relatórios forenses? Qual o limite?
**Impacto:** Proteção contra abuso do endpoint de forense.

**Resposta:** 5 relatórios por minuto

---

## Pergunta 13

**Contexto:** Módulo `leads` — transições de status
**Spec afetada:** [`_reversa_sdd/leads/requirements.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/leads/requirements.md)
**Pergunta:** Quais são as transições de status válidas para leads? (ex: new → contacted → converted → closed?)
**Impacto:** Define a máquina de estados do lead.

**Resposta:** new → contacted → converted → closed

---

## Pergunta 14

**Contexto:** Módulo `leads` — notificações
**Spec afetada:** [`_reversa_sdd/leads/design.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/leads/design.md)
**Pergunta:** Existe notificação (email/SMS) automática para o admin quando um novo lead é capturado?
**Impacto:** Fluxo de acompanhamento comercial.

**Resposta:** Notificação no email contato@bodyharmony.com.br

---

## Pergunta 15

**Contexto:** Módulo `licenciada` — CRUD de licenciadas
**Spec afetada:** [`_reversa_sdd/licenciada/requirements.md`](file:///f:/Body-Harmony-Remake/_reversa_sdd/licenciada/requirements.md)
**Pergunta:** Qual o fluxo de "força de troca de senha" para licenciadas com senha padrão 'Mudar123!'? É feito no primeiro login ou via ação admin?
**Impacto:** Fluxo de onboarding de novas licenciadas.

**Resposta:** Deve ser feito no primeiro login
