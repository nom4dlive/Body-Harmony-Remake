# Tasks: Workshop

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] React com styled-components, framer-motion e react-icons instalados
- [ ] Componentes SEOHead, ImageWithFallback, AnimeDivider, WaveDivider disponíveis

## Tarefas

### T01: Criar página do workshop com lazy loading
- **Arquivo legado:** `pages/Workshop/Workshop.jsx`, `App.jsx:20`
- **Descrição:** Criar componente `Workshop` com layout completo: header com título animado, seção de foto, highlights com ícones, CTA e SEO Head. Adicionar rota lazy loaded em `/workshop`.
- **Critério de pronto:** Rota `/workshop` renderiza landing page completa com animações
- **Confidência:** 🟢 CONFIRMADO

### T02: Implementar SEO Head
- **Arquivo legado:** `pages/Workshop/Workshop.jsx`
- **Descrição:** Adicionar SEOHead com title="Workshop Eletroestimulação - Body Harmony" e description apropriada.
- **Critério de pronto:** Meta tags title e description presentes no HTML renderizado
- **Confidência:** 🟢 CONFIRMADO

### T03: Implementar CTA com link externo
- **Arquivo legado:** `pages/Workshop/Workshop.jsx`
- **Descrição:** Adicionar botão/banner CTA com link para página de inscrição externa. Estilo destacado com cor gold (#ED7E13).
- **Critério de pronto:** CTA visível e clicável, redireciona para URL correta
- **Confidência:** 🟡 INFERIDO

## Tarefas de Teste

- [ ] TT-01: Testar renderização da página em mobile e desktop
- [ ] TT-02: Testar lazy loading (rota carrega sob demanda)

## Ordem Sugerida

1. T01 (página completa) — estrutura principal
2. T02 (SEO) — otimização
3. T03 (CTA) — ação de conversão

## Lacunas Pendentes (🔴)

- URL de destino do CTA não documentada
- Conteúdo pode ser dinâmico via DataContext? (não verificado)
