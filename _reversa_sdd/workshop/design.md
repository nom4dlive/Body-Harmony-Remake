# Design: Workshop

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/workshop` | `Workshop.jsx` | Landing page do workshop |

## Estrutura da Página

1. **Header**: Título principal com animação (framer-motion) + subtítulo explicativo 🟢
2. **PhotoSection**: Imagem demonstrativa com sombra e borda arredondada 🟢
3. **Highlights**: Lista de benefícios com ícones (FaBolt, FaCheckCircle, FaClock etc) 🟢
4. **CTA Section**: Botão de chamada para ação (inscrição/compra) com link externo — `https://kiwify.app/0VDhCgn` 🟢
5. **SEOHead**: Meta tags para SEO 🟢
6. **Dividers**: Elementos decorativos (AnimeDivider, WaveDivider) 🟢

## Fluxo Principal

1. Visitante acessa `/workshop` 🟢
2. React Router carrega `Workshop` component (lazy loaded) 🟢
3. Componente renderiza seções com animações de entrada (framer-motion) 🟢
4. Visitante pode navegar pelas seções ou clicar no CTA 🟢

## Dependências

- React: `styled-components`, `framer-motion`, `react-icons`
- Componentes: `SEOHead`, `ImageWithFallback`, `AnimeDivider`, `WaveDivider`
- Context: `DataContext` (para configurações do site)

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Lazy loading do componente | `App.jsx:20` | 🟢 |
| Animações com framer-motion | `Workshop.jsx:3` | 🟢 |
| Estilização com styled-components | `Workshop.jsx:1` | 🟢 |
| Conteúdo estático (sem backend) | Nenhum controller PHP encontrado | 🟢 |

## Riscos e Lacunas

- 🟡 Conteúdo pode ser gerenciado via DataContext?
