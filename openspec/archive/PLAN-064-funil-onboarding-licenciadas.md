# ⚛️ PLAN-064 — Funil de Onboarding de Licenciadas, Pré-cadastro com OCR e Automação de Contratos

# 🎯 Objetivo Fullstack
Implementar o pipeline completo de onboarding de novas licenciadas integrado à Agenda do Gestor:
1. **Link Público de Auto-preenchimento com OCR:** Envio de link seguro via WhatsApp para a licenciada realizar o pré-cadastro com upload de fotos de documentos (RG/CPF/CNPJ) e extração automática de dados.
2. **Automação de Tarefas na Agenda do Gestor:** Geração de tarefa automática *"Emitir contrato para [Nome]"* assim que o pré-cadastro é concluído.
3. **Emissão de Contrato em 1-Clique:** Auto-preenchimento das variáveis do contrato com os dados validados do pré-cadastro e disparo do link de assinatura digital SHA-256 no WhatsApp (PLAN-051).
4. **Régua de Cobrança Automática via WhatsApp:** Disparo de lembrete amigável em 24h caso o contrato não seja assinado, atualizando o badge de status na Agenda.
5. **Validação de Pagamento em 2 Etapas:** Após a assinatura digital, o gestor revisa a confirmação do pagamento e clica em *"Confirmar Pagamento & Liberar Acesso"*, desencadeando a liberação dos módulos LMS (PLAN-009/011), envio do PDF chancelado e encerramento da tarefa.
6. **Visão Dupla do Funil (React V3.1):** Kanban de 5 colunas de onboarding (`[1. Pré-cadastro] → [2. Contrato Emitido] → [3. Aguardando Assinatura] → [4. Validar Pagamento] → [5. Ativo & Liberado]`) + Tabela detalhada de Licenciadas com busca e filtros rápidos.

# 📜 Contratos de API (REGRA 1)
- [ ] Contrato JSON criado em [`openspec/contracts/admin/gestor-onboarding-funnel.json`](file:///f:/Body-Harmony-Remake/openspec/contracts/admin/gestor-onboarding-funnel.json)
- [ ] Validar 100% de simetria do payload de entrada e saída (endpoints de link público, OCR upload, geração 1-clique e confirmação 2 etapas)

# 🚫 Espaço Negativo (Fora de Escopo)
- [ ] Alterações na infraestrutura física de containers da VPS Hostinger, Docker Compose ou Traefik (Imutável)
- [ ] Alterações no container de banco de dados MySQL ou remoção do loopback `127.0.0.1:3306` (Imutável)
- [ ] Adição de serviços externos pagos de OCR (Utilização de serviço OCR PHP puro/naitvo defensivo)

# 🗄️ Camada de Dados (SQL)
- [ ] Alterações declaradas em `infrastructure/database/DATABASE_MASTER_V36_1.sql`
- [ ] Migration criada em `infrastructure/database/migrations/V107_Create_Licenciada_Onboarding_Funnel_Table.sql`:
  - `licenciada_onboarding_tokens` (`id`, `token`, `categoria`, `telefone_whatsapp`, `expires_at`, `created_at`)
  - `licenciada_onboarding_requests` (`id`, `token_id`, `nome`, `cpf`, `rg`, `endereco`, `documento_img`, `status`, `contract_uuid`, `created_at`, `updated_at`)

# ⚙️ Camada de Backend (PHP 8.4)
- [ ] Servico [`OnboardingService.php`](file:///f:/Body-Harmony-Remake/apps/web-app/src/backend/api/v1/Services/OnboardingService.php): Gerenciamento do funil de 5 colunas, integração com `AgendaService` e `ContractService`.
- [ ] Servico [`SimpleOcrService.php`](file:///f:/Body-Harmony-Remake/apps/web-app/src/backend/api/v1/Services/SimpleOcrService.php): Leitor defensivo de texto de imagem de documento em PHP.
- [ ] Controller [`OnboardingController.php`](file:///f:/Body-Harmony-Remake/apps/web-app/src/backend/api/v1/Controllers/OnboardingController.php).
- [ ] Mapeamento das rotas em `api/v1/index.php`.

# ⚛️ Camada de Interface (React V3.1)
- [ ] Página [`PublicOnboardingPage.jsx`](file:///f:/Body-Harmony-Remake/apps/web-app/src/frontend/src/pages/Public/PublicOnboardingPage.jsx): Tela mobile-first de pré-cadastro para a licenciada preencher e enviar documento no celular.
- [ ] Componentes em `apps/web-app/src/frontend/src/pages/Gestor/Onboarding/`:
  - [`OnboardingFunnelPage.jsx`](file:///f:/Body-Harmony-Remake/apps/web-app/src/frontend/src/pages/Gestor/Onboarding/OnboardingFunnelPage.jsx): Visão Dupla com alternador entre Kanban de 5 Colunas e Tabela de Licenciadas.
  - [`GenerateContractModal.jsx`](file:///f:/Body-Harmony-Remake/apps/web-app/src/frontend/src/pages/Gestor/Onboarding/GenerateContractModal.jsx): Modal de pré-visualização e envio do contrato em 1-clique.

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Premium (Site/Frontend):** SPA React compilado (`dist/` e `build/public_html`) contendo a `PublicOnboardingPage` e `OnboardingFunnelPage`.
- **VPS Hostinger Dedicada (API/DB):** Migration `V107` no MySQL, endpoints PHP 8.4 e uploads de imagens em `private_uploads/onboarding/`.

# 🔍 Monitoramento Semântico (Regression Watch)
- [ ] Suíte de testes de fumaça CLI [`tests/onboarding_funnel_smoke_test.php`](file:///f:/Body-Harmony-Remake/tests/onboarding_funnel_smoke_test.php).
- [ ] Novo Watchpoint **WP-18** adicionado em `openspec/tracker/regression-watch.md`.

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Falha de upload de imagem ou token expirado impedindo o preenchimento da licenciada.
- **Mitigação:** Tratamento defensivo de extensão de arquivo, limite de 10MB e regeneração fácil de token pelo gestor.
- **Rollback:** Reversão atômica via Git para o commit do `PLAN-063` e execução do script de rollback SQL.

# ✅ Checklist de Execução Atômica
- [ ] 1. Criar Contrato JSON em `openspec/contracts/admin/gestor-onboarding-funnel.json`
- [ ] 2. Criar migration SQL `V107_Create_Licenciada_Onboarding_Funnel_Table.sql`
- [ ] 3. Criar `OnboardingService.php` e `SimpleOcrService.php`
- [ ] 4. Criar `OnboardingController.php` e registrar rotas no `index.php`
- [ ] 5. Desenvolver e passar 100% nos testes CLI `tests/onboarding_funnel_smoke_test.php`
- [ ] 6. Implementar a UI pública `PublicOnboardingPage.jsx` e o painel `OnboardingFunnelPage.jsx`
- [ ] 7. Executar compilação do Vite (`npm run build`)
- [ ] 8. Atualizar `task.md` e `regression-watch.md`
