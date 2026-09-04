# 🧠 BRAINSTORM-004: Gestão Blindada de Cupons de Uso Único e Passaporte Virtual do Congresso

## 📋 Contexto Técnico & Diagnóstico

1. **Correção Imediata de Segurança**: O placeholder que expunha exemplos de cupons reais e isenções (`EX: JOSI20, CONVIDADA100, ATLETA100`) no `CongressCheckoutModal.jsx` foi **removido com sucesso** e substituído por texto neutro profissional (`"DIGITE SEU CÓDIGO PROMOCIONAL"`).
2. **Controle e Segurança de Cupons no Portal do Gestor**:
   - É necessário permitir criar, visualizar, pausar e excluir cupons no Gestor com 1 clique.
   - Suporte a regras de controle: **Uso Único por CPF**, **Limite Total de Usos (`max_uses = 1`)**, **Restrição a CPF Específico**, **Validade por Data** e **Lote Permitido (Apenas VIP / Apenas Experience)**.
   - Histórico em tempo real de quem usou cada cupom (Nome, CPF, Data, Pedido e Status).
3. **Passaporte Virtual do Congresso (Comprovante Digital)**:
   - O participante já tem acesso ao passaporte visual com QR Code dinâmico de check-in, código `BH-ING-...`, local e data.
   - O Gestor precisa personalizar os textos de instrução da portaria, horários de credenciamento e política de acesso no `/portal-gestor/shop`.

---

## 🏗️ Análise Transversal em Seis Camadas

### 1. Dados (MySQL 8.0 & Auto-Ensure)
- Tabela `congress_coupons`:
  - Adicionar colunas: `restricted_cpf` VARCHAR(20) NULL, `expires_at` DATETIME NULL, `allowed_tier_id` INT NULL, `description` VARCHAR(255) NULL.
- Tabela `congress_registrations`:
  - Índice em `coupon_code` para relatório instantâneo de uso.

### 2. Backend (PHP 8.4 — Nexus Protocol V3.1)
- `CongressTicketService.php`:
  - `validateCoupon()`: Validar `max_uses` (se `current_uses >= max_uses` rejeitar), validar `restricted_cpf` (se preenchido, bater com o CPF do checkout), validar `expires_at` (se passado de agora, rejeitar como expirado), e validar se aquele CPF já usou aquele cupom antes (`SELECT COUNT(*) WHERE customer_cpf = ? AND coupon_code = ?`).
  - `listAdminCoupons()`: Retorna todos os cupons com contador de usos e lista de participantes que utilizaram.
  - `saveAdminCoupon()` / `deleteAdminCoupon()`: Criação e edição atômica de cupons.

### 3. APIs & Contratos
- `GET /api/v1/admin/congress/coupons`: Listagem de cupons com detalhes de uso.
- `POST /api/v1/admin/congress/coupons`: Criar/Atualizar cupom (Código, Desconto %, Limite de Usos, Restrição de CPF, Expiração).
- `DELETE /api/v1/admin/congress/coupons/{id}`: Desativar/Excluir cupom.
- `GET /api/v1/admin/congress/coupons/{code}/usages`: Listar pessoas que usaram o cupom.

### 4. Rotas & Navegação
- `/portal-gestor/shop`: Nova sub-aba ou card dedicado **"🏷️ Gestão de Cupons & Isenções"** no Gestor.
- `/congresso/ticket/{token}`: Exibição do Passaporte Digital Oficial em alta definição para impressão ou download.

### 5. Interface (Frontend React V3.1 — Gestor & Congresso)
- **Tabela de Cupons no Gestor**:
  - Modal rápido: "Novo Cupom" (Código, Tipo, Desconto %, Limite de 1 uso, Restrito a CPF opcional).
  - Tabela com colunas: Código, Tipo, Desconto, Usos (Ex: `1/1 Usado` ou `0/1 Disponível`), Status (Ativo/Inativo), Botão "Ver Quem Usou" e Botão "Excluir".
  - Card de **Customização do Passaporte Virtual**: edição do texto de instruções de credenciamento (ex: *"Apresente este documento na recepção a partir das 08h00"*).

### 6. Marca & Identidade (Aura Grand Prix Luxury)
- Passaporte Digital: Design de luxo com bordas ouro `#ED7E13`, gradiente Black Piano `#080A0C`, carimbo de autenticidade criptográfica e QR Code de leitura rápida para a equipe de recepção no dia 07/Nov.

---

## 🧩 Três Opções de Arquitetura

### Opção A — Conservadora (Low Risk) ⚡
**Gerenciador de Cupons com Validação de Uso Único por Quantidade (`max_uses = 1`)**
- ✅ Prós: Entrega rápida. Você cria cupons de uso único e o sistema bloqueia no 2º uso.
- ❌ Contras: Não restringe por CPF nominal e não tem tela dedicada para ver a lista de quem usou.
- 📊 Esforço: 1h30 | 🟢 Risco: Mínimo

### Opção B — Recomendada (Balanced & Blindagem Total) 🏆
**Central Completa de Cupons no Gestor (Uso Único + Trava por CPF + Histórico de Quem Usou + Customização do Passaporte)**
- ✅ Prós: 100% à prova de vazamentos. Você define se o cupom é de uso único geral (`max_uses = 1`) ou restrito ao CPF da atleta/licenciada. O Gestor tem tabela para ver exatamente quem usou com data e CPF. Permite personalizar o texto de instruções do passaporte digital.
- ❌ Contras: Requer novo painel de cupons no Gestor e endpoints CRUD.
- 📊 Esforço: 2h30 | 🟡 Risco: Baixo

### Opção C — Next-Gen (High Performance) 🚀
**Tudo da Opção B + Geração de PDF Oficial em Alta Resolução com Carimbo Holográfico e Envio Automático por WhatsApp**
- ✅ Prós: Gera PDF do passaporte via biblioteca gráfica no servidor e envia no WhatsApp do comprador via Evolution API.
- ❌ Contras: Maior tempo de compilação gráfica de PDFs.
- 📊 Esforço: 4h | 🔴 Risco: Médio

---

## 🏆 Veredito Técnico

**Opção B (Recomendada)**: Dá a você controle absoluto sobre cupons (quem pode usar, quantas vezes pode usar e quem já usou) sem brechas de segurança, além de permitir personalizar o Passaporte Digital do comprador diretamente pelo Portal do Gestor.
