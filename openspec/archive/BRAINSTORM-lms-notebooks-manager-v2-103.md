# 🧠 Brainstorm — Cockpit Avançado de Cadernos & IA no Gestor LMS

> **Nexus Protocol V3.1 — ID:** BRAINSTORM-103  
> **Assunto:** Interface Intuitiva, Controle Total de Módulos, Live Feedback de Transcrição e Telemetria de Beta Testers  
> **Data:** 2026-08-24  

---

## 1. Contexto & Diagnóstico da Interface Atual

Na primeira versão entregue da aba **"Cadernos & IA (Beta)"** em [`/portal-gestor/lms`](https://bodyharmony.com.br/portal-gestor/lms):
- O contador exibia 0 módulos devido a divergência no nome da coluna SQL (`course_id` / `order_index` vs schema físico real `display_order` / `is_exclusive` da tabela `lms_modules`).
- O gestor necessita de:
  1. **Visualização Clara e Filtrável dos Módulos:** Filtro por Categoria (Formação Regular vs Especializações Exclusivas) e contagem real de aulas em vídeo.
  2. **Gaveta de Execução em Tempo Real (Live Drawer Console):** Feedback visual passo a passo do pipeline de extração de áudio e transcrição com Faster-Whisper.
  3. **Painel de Detalhes do Caderno (Drawer de Fontes & Transcrições):** Leitura de transcrições, minutagem e upload 'drag & drop' de PDFs/protocolos complementares pelo gestor.
  4. **Cockpit com Telemetria de Créditos & Ações Rápidas:** Visualização do consumo diário de cada licenciada, ações em lote e atalho para WhatsApp.

---

## 2. Análise Transversal em Seis Camadas

| Camada | Análise de Impacto |
| :--- | :--- |
| **🗄️ Dados (MySQL)** | Correção e alinhamento das consultas SQL com as colunas nativas `display_order`, `is_exclusive` e `is_active` em `lms_modules` e `lms_lessons`. |
| **⚙️ Backend (PHP 8.4)** | `LmsNotebookService.php` estendido com métodos de listagem detalhada de aulas (`getModuleLessonsWithTranscripts`), ingestão de fontes manuais (PDFs) e telemetria de consumo. |
| **📑 APIs & Contratos** | Novos endpoints: `GET /api/v1/admin/lms/notebooks/modules/{id}/sources`, `POST /api/v1/admin/lms/notebooks/modules/{id}/sources/pdf`. |
| **🌐 Rotas & Navegação** | Permanece na rota integrada `/portal-gestor/lms` (aba `Cadernos & IA`), com gavetas modais reativas (Drawers). |
| **⚛️ Interface (React)** | Componente `LMSNotebooksManager.jsx` com Live Drawer Console, Drawer de Fontes/PDFs, Filtros de Categoria e tabela com telemetria. |
| **🎨 Marca & Identidade** | Conformidade rigorosa com **Navy Blue (`#0A3E60`)** e **Luxury Gold (`#ED7E13`)**, botões com alvos de toque $\ge 44	ext{px}$ e animações suaves via Framer Motion. |

---

## 3. As Três Opções de Arquitetura

### Opção A (Conservadora — Correção de Query & Modais Simples)
- Corrige as consultas SQL para exibir os módulos.
- Exibe modais padrão para feedback de sincronização sem live streaming de logs.
- *Prós:* Menor esforço.
- *Contras:* Feedback estático, sem visualização granular do progresso da transcrição.

### Opção B (Recomendada — Live Console Drawer + Curadoria Completa de Fontes + Telemetria)
- Correção precisa das queries SQL nativas (`lms_modules` / `lms_lessons` / `licenciadas`).
- **Live Drawer Console:** Gaveta lateral com barra de progresso (0-100%) e logs passo a passo das aulas processadas pelo Faster-Whisper.
- **Drawer de Fontes do Caderno:** Inspeção do texto transcrito com minutagem e upload 'drag & drop' de PDFs complementares pelo gestor.
- **Cockpit com Telemetria de Créditos:** Visualização do consumo diário de créditos, filtros rápidos (Ativas/Pendentes), ações em lote e botão de WhatsApp direto.
- *Prós:* Controle total para o gestor, altíssima clareza visual, feedback em tempo real e experiência de uso no padrão Luxury.
- *Contras:* Requer novos componentes de Drawer no frontend.

### Opção C (Next-Gen — WebSocket Bidirecional com Grafos Interativos de Embeddings)
- Streaming via WebSockets direto do worker da VPS para renderizar visualização 3D dos nós de conhecimento do módulo.
- *Prós:* Interface futurista.
- *Contras:* Complexidade desnecessária para a fase de testes beta.

---

## 4. Veredito Técnico
A **Opção B** é a arquitetura ideal. Ela resolve a causa raiz da listagem vazia, implementa o feedback ao vivo do Faster-Whisper em uma gaveta elegante e dá total autonomia de curadoria ao Gestor.
