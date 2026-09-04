# PLAN-192: Ajustes Finais de Lançamento (Deleção de Pedidos, Timer PIX 7min e Limpeza do Hero)

## 🎯 Objetivo
1. **Deleção Completa de Transações do Congresso**: Permitir que o superadmin exclua pedidos de teste tanto de `shop_orders` quanto de `congress_registrations` e seus leads.
2. **Timer Regressivo do PIX (7 minutos)**: Substituir o prazo estático distante de 2027 por um contador regressivo visual de 7 minutos (`07:00` ➔ `00:00`) com auto-expiração e botão de gerar novo PIX.
3. **Limpeza do Hero no Congresso**: Eliminar o cabeçalho sobreposto no topo da página `/congresso`.

## 🛠️ Checklist de Execução
- [ ] 1. Backend: Atualizar `ShopService::deleteOrder` para apagar registros em `congress_registrations` e `shop_orders`.
- [ ] 2. Frontend: Implementar timer regressivo de 7 minutos no modal de PIX (`CongressCheckoutModal.jsx`).
- [ ] 3. Frontend: Remover `TopNavBar` sobreposto em `CongressoPage.jsx`.
- [ ] 4. Compilar release e sincronizar com Hostinger.
- [ ] 5. Testes automatizados e registro no Vault.
