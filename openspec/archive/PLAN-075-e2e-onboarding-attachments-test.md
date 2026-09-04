# PLAN-075: Teste Completo Ponta a Ponta do Onboarding com Anexos de Documentos, Emissão de Contrato, Assinatura e Ativação

**Identificador:** `PLAN-075-e2e-onboarding-attachments-test`  
**Data:** 2026-08-21  
**Autor:** Antigravity Agent  
**Protocolo:** Nexus Protocol V3.1 (PHP 8.4 / React 18)

---

## 🎯 1. Objetivo
Executar o ciclo 100% completo do Onboarding em produção, incluindo:
1. Geração de Token de Convite
2. Submissão multipart com 5 arquivos de documentos reais gerados dinamicamente (RG/CNH, Comprovante PIX, Comprovante de Residência, Cartão CNPJ, Certificados)
3. Persistência de uploads e criação de evento na Agenda
4. Emissão de minuta contratual em 1-clique
5. Coleta de assinatura digital das partes
6. Validação de pagamento e ativação oficial da nova Licenciada no banco de dados
7. Download do ZIP completo de auditoria documental

---

## 🛡️ 2. Espaço Negativo
* Infraestrutura VPS / Traefik / Docker imutável.
* Proteção contra vazamento de credenciais.

---

## 📋 3. Checklist de Execução
- [ ] 1. Elaborar script de teste automatizado ponta a ponta (`tests/e2e_full_onboarding_test.php`).
- [ ] 2. Executar localmente e em produção para validar todos os 6 estágios.
- [ ] 3. Se houver qualquer falha ou exceção, identificar e corrigir imediatamente no código.
- [ ] 4. Publicar release final na Hostinger e registrar evidências no Vault.
