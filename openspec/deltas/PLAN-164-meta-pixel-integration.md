# 🎯 PLAN-164: Integração do Meta Pixel Oficial (ID: 964269182520586)

## [OBJETIVO]
Instalar o código oficial do Meta Pixel (`964269182520586`) no `index.html` do ecossistema Body Harmony e garantir o disparo automático dos eventos de conversão (`PageView`, `InitiateCheckout` e `Purchase`) através do serviço `telemetry.js`.

---

## 🚫 [ESPAÇO NEGATIVO]
- NÃO remover o Google Tag Manager (`GTM-NKXVL374`) já instalado (ambos devem coexistir harmoniosamente).
- NÃO alterar endpoints PHP de pagamento ou contratos de API.
- NÃO bloquear o carregamento da página caso o script da Meta demore a responder (usar flag `async`).

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Passo 1 (Inserção do Snippet)**: Inserir o script oficial do Meta Pixel no `<head>` e o `<noscript>` no `<body>` de `apps/web-app/index.html`.
- [ ] **Passo 2 (Harmonização no Telemetry Hub)**: Validar e refinar `telemetry.js` para garantir formato ideal de dados para o Facebook (`currency: 'BRL'`, `value`, `content_name`).
- [ ] **Passo 3 (Validação Determinística)**: Executar `nexus_gate.ps1` com Exit Code 0.
- [ ] **Passo 4 (Deploy & Auditoria ao Vivo)**: Executar deploy em produção na Hostinger e testar a presença do Meta Pixel no HTML de `/congresso`.

---

## 📁 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `apps/web-app/index.html`
- `apps/web-app/src/frontend/src/services/telemetry.js`
- `openspec/tracker/task.md`
