# 🎯 Objetivo Fullstack (PLAN-069)
Refatorar integralmente a interface visual da **Agenda & Pendências dos Gestores** ([`GestorAgendaPage.jsx`](file:///f:/Body-Harmony-Remake/apps/web-app/src/frontend/src/pages/Gestor/Agenda/GestorAgendaPage.jsx)), substituindo as classes utilitárias por **`styled-components`** nativos com a identidade visual **Luxury Navy (`#0A3E60`) & Gold (`#ED7E13`)**, alvos de toque >= 44x44px e encapsulamento no `<AdminLayout>`.

---

# 📜 Contratos de API (REGRA 1)
- [x] Mantida 100% de simetria com [`openspec/contracts/admin/gestor-agenda.json`](file:///f:/Body-Harmony-Remake/openspec/contracts/admin/gestor-agenda.json).

---

# 🚫 Espaço Negativo (Fora de Escopo)
- Nenhuma alteração nas tabelas MySQL (`gestor_agenda_events`, `gestor_agenda_subtasks`, etc.) nem nos endpoints backend PHP 8.4 (`api/v1/admin/agenda/*.php`).

---

# ⚛️ Camada de Interface (React V3.1)
- [ ] **`GestorAgendaPage.jsx`**: Envelopar com `<AdminLayout>`, Bento Grid de 4 KPIs, barra de filtros e controle de visualização.
- [ ] **`AgendaCalendarView.jsx`**: Grade CSS nativa de 7 colunas (`repeat(7, 1fr)`), cabeçalho de navegação mensal, dias da semana e badges color-coded.
- [ ] **`AgendaKanbanListView.jsx`**: 4 colunas fluidas (*Pendente*, *Em Andamento*, *Concluído*, *Cancelado*) com cards ricos e empty states.
- [ ] **`EventModal.jsx`**: Modal estilizado com backdrop blur e formulário responsivo.
- [ ] **`EventDetailsDrawer.jsx`**: Drawer lateral com abas de subtarefas, comentários e anexos.

---

# 🔍 Monitoramento Semântico (Regression Watch)
- [ ] Executar `npm run build:hostinger` para validação de compilação sem erros JSX/CSS.
- [ ] Executar `php tests/agenda_smoke_test.php` para atestar integridade dos dados (6/6 PASS).

---

# ✅ Checklist de Execução Atômica
- [x] 1. Criar plano PLAN-069
- [ ] 2. Refatorar `GestorAgendaPage.jsx` com `AdminLayout` e styled-components
- [ ] 3. Refatorar `AgendaCalendarView.jsx` com grade real de 7 colunas
- [ ] 4. Refatorar `AgendaKanbanListView.jsx` com colunas Kanban estilizadas
- [ ] 5. Refatorar `EventModal.jsx` e `EventDetailsDrawer.jsx`
- [ ] 6. Executar build `npm run build:hostinger` e testes de fumaça
- [ ] 7. Registrar no `regression-watch.md` e Obsidian Vault
