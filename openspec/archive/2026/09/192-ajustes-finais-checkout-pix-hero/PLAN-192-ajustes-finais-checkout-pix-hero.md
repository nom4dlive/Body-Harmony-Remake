# PLAN-192: Ajustes Finais de Lançamento (Deleção de Pedidos, Timer PIX 7min e Limpeza do Hero)

- [x] 1. Backend: Atualizar `ShopService::deleteOrder` para apagar registros em `congress_registrations` e `shop_orders`.
- [x] 2. Frontend: Implementar timer regressivo de 7 minutos no modal de PIX (`CongressCheckoutModal.jsx`).
- [x] 3. Frontend: Remover `TopNavBar` sobreposto em `CongressoPage.jsx`.
- [x] 4. Compilar release e sincronizar com Hostinger.
- [x] 5. Testes automatizados e registro no Vault.
