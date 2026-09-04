# 🏛️ PLAN-226: ContactResolverService, Ingestão Assíncrona de Mídias & Reconciliação Anti-Deriva

## 🎯 1. [OBJETIVO]
Implementar três camadas de resiliência e conciliação de dados inspiradas no TopwebCRM no backend do CRM Body Harmony: resolução de contatos com normalização de 9º dígito e LIDs, ingestão assíncrona de mídias sem travamento de webhooks e script CLI de reconciliação anti-deriva para recuperação retroativa de mensagens.

---

## 🚫 2. [ESPAÇO NEGATIVO]
1. NÃO alterar as regras de negócio de checkout e emissão de contratos.
2. NÃO executar downloads bloqueantes durante a execução do webhook da Evolution API.
3. NÃO duplicar mensagens no script de reconciliação.

---

## ⚡ 3. [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Passo 1 (ContactResolver)**: Criar `ContactResolverService.php` com variantes de 9º dígito e consulta em `licenciadas`, `alunas`, `crm_patient_profiles` e `crm_conversations`.
- [ ] **Passo 2 (Webhook Assíncrono)**: Atualizar `evolution_webhook.php` com `ContactResolverService` e persistência sem downloads bloqueantes.
- [ ] **Passo 3 (Reconciliação CLI)**: Criar `reconcile_crm.php` para rodar via cron e recuperar mensagens órfãs da Evolution API.
- [ ] **Passo 4 (Validação & Gates)**: Validar sintaxe PHP, executar script CLI e rodar `npm test`.

---

## 📁 4. [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `apps/web-app/src/backend/api/v1/Services/ContactResolverService.php`
- `apps/web-app/src/backend/api/v1/crm/evolution_webhook.php`
- `apps/web-app/src/backend/bin/reconcile_crm.php`
- `openspec/contracts/crm/crm-contact-resolver.json`
