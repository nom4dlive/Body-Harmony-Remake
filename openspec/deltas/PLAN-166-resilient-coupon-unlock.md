# 🎯 PLAN-166: Desbloqueio Resiliente de Cupons & Blindagem contra Tentativas Pendentes

## [OBJETIVO]
Garantir que cupons com restrição de "1 uso por CPF" só sejam considerados utilizados após a **confirmação real do pagamento** (`CONFIRMED`, `RECEIVED`, `PAID`). Tentativas pendentes, abandonadas ou recusadas no cartão de crédito (`PENDING`) não devem queimar o cupom, permitindo que alunas como a Marina tentem novamente sem atrito.

---

## 🚫 [ESPAÇO NEGATIVO]
- NÃO remover a trava de segurança de 1 uso por CPF para compras já pagas.
- NÃO alterar a taxa de juros do Asaas ou o split de parcelamento.
- NÃO quebrar a integração com o webhook do Asaas.

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Passo 1 (Refatorar Query de CPF)**: Em `CongressTicketService.php`, restringir a contagem de uso do cupom a `payment_status IN ('CONFIRMED', 'RECEIVED', 'PAID')`.
- [ ] **Passo 2 (Reversão de Incremento em Falhas)**: Se a tentativa de cartão falhar e cair no fallback, não travar o contador global se a cliente for tentar novamente com outro cartão.
- [ ] **Passo 3 (Verificação & Gate)**: Executar teste de validação de cupom e rodar `nexus_gate.ps1` com Exit Code 0.
- [ ] **Passo 4 (Deploy & Produção)**: Executar `deploy-pro.ps1` para publicar o fix imediatamente na Hostinger.

---

## 📁 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `apps/web-app/src/backend/api/v1/Services/CongressTicketService.php`
- `openspec/tracker/task.md`
