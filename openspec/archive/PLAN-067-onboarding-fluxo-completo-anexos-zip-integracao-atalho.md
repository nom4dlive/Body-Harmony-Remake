# PLAN-067 — Fluxo Completo de Onboarding: Anexos Múltiplos, Download ZIP, Validação do Gestor e Integração com Atalho de Contratos

**Status**: 🟡 `PLANNING` (Aguardando Aprovação)  
**Protocolo**: Nexus Protocol V3.1 (Doctor Harmony Protocol / PHP 8.4)  
**Data**: 2026-08-21  
**Contrato de API**: [`openspec/contracts/admin/onboarding-approval-integration.json`](../contracts/admin/onboarding-approval-integration.json)  

---

## 🎯 Objetivo Fullstack

Implementar o fluxo ponta-a-ponta definitivo para a entrada de novas licenciadas no ecossistema Body Harmony:

1. **Formulário Público All-in-One (`PublicOnboardingPage.jsx`)**:
   - Dados Pessoais: Nome, CPF, RG, E-mail, WhatsApp, Nacionalidade, Estado Civil, Profissão.
   - Dados PJ: CNPJ, Razão Social, Nome Fantasia, Representante Legal, Toggle de CNPJ em Abertura.
   - Redes Sociais: Instagram oficial/profissional.
   - Endereço: Busca automática via CEP (ViaCEP API), Logradouro, Número, Complemento, Bairro, Cidade e UF.
   - Anexos (até 8 arquivos com preview e drag-and-drop): CNH/RG (Frente/Verso), Comprovante de Residência, Comprovante de Pagamento da Taxa Inicial, Cartão CNPJ / Contrato Social e Certificados de Cursos.

2. **Visualização, Análise e Download pelo Gestor (`OnboardingFunnelPage.jsx`)**:
   - Painel Lateral / Drawer deslizante com ficha completa de pré-cadastro.
   - Galeria com miniaturas e visualizador em alta definição de todos os documentos anexados.
   - Botão **"📥 Baixar Todos os Documentos (.ZIP)"** que compila os arquivos instantaneamente via backend.
   - Formulário de revisão e ajuste de dados cadastrais antes da homologação.

3. **Validação & Integração Central (`OnboardingService.php`)**:
   - Botão **"✅ Aprovar + Criar Licenciada & Emitir Contrato"**.
   - Criação/Atualização atômica do registro na tabela `licenciadas` com todos os campos (CPF, CNPJ, Razão Social, Instagram, Endereço, CEP e Anexos).
   - Geração automática do Contrato DRAFT vinculado ao UUID na tabela `contracts`.
   - Transição de estágio no Funil para `CONTRATO_EMITIDO`.

4. **Sincronização com o ContractWizard (`ContractWizard.jsx`)**:
   - O campo **"Atalho: Licenciada Já Cadastrada:"** reconhece imediatamente a nova licenciada e preenche 100% das variáveis do contrato (Pessoa Jurídica por padrão conforme REGRA 9, endereço, dados fiscais e contatos).

---

## 📜 Contratos de API (REGRA 1)
- [x] Contrato JSON criado em `openspec/contracts/admin/onboarding-approval-integration.json`.
- [x] Endpoint `POST /api/v1/public/onboarding/submit` expandido para suportar múltiplos anexos multipart/form-data e novos campos (Instagram, CNPJ, Razão Social).
- [x] Endpoint `GET /api/v1/admin/onboarding/{id}/download-zip` para streaming de arquivo compactado.
- [x] Endpoint `POST /api/v1/admin/onboarding/{id}/approve-and-integrate` para aprovação, criação da licenciada e pré-geração do contrato.

---

## 🚫 Espaço Negativo (Fora de Escopo)
- Não alterar a estrutura de containers Docker/Traefik nem remover a proteção do MySQL `127.0.0.1:3306`.
- Não violar a REGRA 8: a coluna de documento na tabela `licenciadas` é estritamente `cpf`.
- Não violar a REGRA 9: qualificação de contrato de licenciamento é estritamente PJ por padrão.
- Não violar a REGRA 11: dados institucionais da LICENCIANTE são estritamente imutáveis.

---

## 🗄️ Camada de Dados (SQL)
- [ ] Criar Migration `V108_Enhance_Licenciadas_And_Onboarding_Attachments.sql`:
  - `licenciada_onboarding_requests`: Adicionar `instagram`, `razao_social`, `nome_fantasia`, `cnpj`, `is_cnpj_em_abertura`, `comprovante_pagamento_img`, `comprovante_residencia_img`, `contrato_social_img`, `certificados_imgs` (JSON).
  - `licenciadas`: Adicionar colunas `cnpj`, `razao_social`, `nome_fantasia`, `instagram`, `cep`, `endereco`, `numero`, `complemento`, `bairro`, `documentos_anexos` (JSON), `origem_onboarding_request_id`.

---

## ⚙️ Camada de Backend (PHP 8.4)
- [ ] `OnboardingService.php`:
  - Processamento e armazenamento seguro de múltiplos arquivos com hashes e validação MIME (PDF/JPG/PNG/WEBP).
  - Método `generateDocumentsZip(int $requestId)` com `ZipArchive`.
  - Método `approveAndIntegrateLicenciada(int $requestId, array $validatedData, int $adminId)`.
- [ ] `OnboardingController.php`: Métodos `downloadZip()` e `approveAndIntegrate()`.
- [ ] `index.php`: Registro de rotas com middleware de autenticação admin.

---

## ⚛️ Camada de Interface (React V3.1)
- [ ] `PublicOnboardingPage.jsx`:
  - Seções: Dados Pessoais, Empresa & CNPJ, Redes Sociais, Endereço com auto-preenchimento por CEP, e Zona de Upload Múltiplo (até 8 arquivos com feedback visual).
- [ ] `OnboardingFunnelPage.jsx`:
  - Drawer lateral com ficha de dados completos, galeria de miniaturas de documentos com modal de zoom, botão de download ZIP e botão de aprovação com edição.
- [ ] `ContractWizard.jsx`:
  - Leitura aprimorada no dropdown "Atalho: Licenciada Já Cadastrada:" para autopreencher todos os dados (CNPJ, Razão Social, Instagram, Endereço completo).

---

## 🔍 Monitoramento Semântico (Regression Watch)
- [ ] Smoke tests `tests/onboarding_funnel_smoke_test.php` expandidos para cobrir upload de anexos múltiplos, ZIP e integração direta.
- [ ] Build Vite `npm run build` com Exit Code 0.

---

## 🛡️ Matriz de Risco & Rollback
- **Risco:** Incompatibilidade com registros legados de licenciadas sem as novas colunas.
- **Mitigação:** Colunas adicionadas com `DEFAULT NULL` e mapeamentos defensivos com fallback em PHP/JS.
- **Rollback:** `git revert` e reexecução das migrations anteriores.

---

## ✅ Checklist de Execução Atômica
- [ ] 1. Migration `V108_Enhance_Licenciadas_And_Onboarding_Attachments.sql`
- [ ] 2. Expansão do `OnboardingService.php` (Uploads múltiplos, ZIP, Aprovação & Integração)
- [ ] 3. Endpoints no `OnboardingController.php` e rotas em `index.php`
- [ ] 4. Atualização do `PublicOnboardingPage.jsx` com novos campos e galeria de upload
- [ ] 5. Implementação do Drawer de Análise e Download ZIP em `OnboardingFunnelPage.jsx`
- [ ] 6. Ajuste do autofill em `ContractWizard.jsx` para consumo dos novos campos
- [ ] 7. Atualização do service `api.js`
- [ ] 8. Extensão do teste automatizado em `tests/onboarding_funnel_smoke_test.php`
- [ ] 9. Execução do build Vite (`npm run build`)
- [ ] 10. Atualização do tracker e registro no Vault Obsidian
