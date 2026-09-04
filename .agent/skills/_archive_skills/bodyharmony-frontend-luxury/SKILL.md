---
name: bodyharmony-frontend-luxury
description: "Master Frontend & Luxury UI/UX Engineering skill for the Body Harmony ecosystem (Nexus Protocol V3.1 / Aura Grand Prix). Use ALWAYS when designing, building, modifying, styling, refactoring, or reviewing any React components, landing pages, admin dashboards, shop pages, modals, drawers, tables, forms, or UI layouts. Enforces strict luxury design tokens (Navy #0A3E60, Gold #ED7E13), mobile-first touch ergonomics (>=44px), zero whitespace waste, compact high-density viewports (<=800px vertical fit), Lucide-React icon standards, React 18 state patterns, authenticated API client resilience (api.js / bh_auth), and user-first async states."
origin: Body Harmony Nexus V3.1
---

# 👑 Body Harmony Luxury Frontend & UI/UX Master Protocol (Nexus V3.1)

Esta é a **Skill Mestra Canônica de Engenharia Frontend & Design System Luxury** do ecossistema Body Harmony. Ela consolida as regras absolutas de design visual, ergonomia de viewport, componentes React 18, gestão de estados assíncronos e performance.

---

## 🏛️ 1. Identidade Visual Luxury & Tokens Oficiais (Aura Grand Prix)

O público e as licenciadas Body Harmony exigem uma interface refinada, clínica e de altíssima fidelidade estética.

### 🎨 Paleta de Cores Canônica

| Token / Função | Código Hex / Gradiente | Uso Obrigatório |
| :--- | :--- | :--- |
| **Primary Navy** | `#0A3E60` | Links secundários, headers institucionais, bases de cards. |
| **Luxury Gold** | `#ED7E13` | CTAs principais, botões de ação, badges de destaque e acentos. |
| **Gold Highlight** | `#FBBF24` | Destaques de gradientes metálicos e hover states dourados. |
| **Gold Deep** | `#D97706` | Sombras e bordas de botões dourados luxury. |
| **Dark Slate Primary** | `#0B132B` | Fundo principal da aplicação em Dark Mode. |
| **Dark Slate Surface** | `#11223A` | Superfície de cards, modais, sidebars e tabelas. |
| **Clean Light Surface**| `#FFFFFF` / `#F5F5F5` | Fundo e cartões em páginas de alta claridade / impressão. |
| **Text Primary (Dark)**| `#FFFFFF` ou `#F8FAFC` | Títulos e textos de alta legibilidade em temas escuros. |
| **Text Muted** | `#94A3B8` ou `#64748B` | Subtítulos, timestamps e labels secundárias. |
| **Border Luxury** | `rgba(237, 126, 19, 0.25)` | Bordas finas metálicas em cards selecionados/ativos. |
| **Border Slate** | `rgba(30, 58, 95, 0.5)` | Linhas de separação e bordas de containers padrão. |

### 🚫 Proibições Cromáticas Estritas
- **NUNCA** utilize cores primárias puras de navegador (`red`, `blue`, `green`, `yellow`, `black`).
- **NUNCA** utilize gradientes roxos/violetas genéricos de SaaS padrão.
- Para status semânticos, utilize sempre variantes contidas:
  - **Sucesso:** `#166534` (texto) / `#DCFCE7` (fundo) ou `#10B981` (dark).
  - **Alerta:** `#854D0E` (texto) / `#FEF9C3` (fundo) ou `#F59E0B` (dark).
  - **Erro:** `#991B1B` (texto) / `#FEE2E2` (fundo) ou `#EF4444` (dark).

### ✨ Gradiente Dourado Metálico (*ouro:texto*)
Para textos de alto impacto comercial (como títulos do Congresso e planos VIP):
```css
background: linear-gradient(135deg, #ED7E13 0%, #FBBF24 50%, #D97706 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## 📱 2. Ergonomia, Responsividade Total & Zero Whitespace Waste

### 📐 Regra de Densidade e Ajuste Vertical ($\le 800\text{px}$)
As páginas administrativas e painéis do Gestor devem caber em viewports verticais padrão de laptops e tablets sem exigir rolagem vertical desnecessária para visualizar a navegação e os cards principais:
1. **Margem de Header/Logo:** `margin-bottom: \le 1rem` (`16px`). É proibido empilhar títulos redundantes abaixo de logotipos.
2. **Padding Interno de Itens:** Em listas, tabelas e menus, manter padding $\le 0.5\text{rem}$ a $0.75\text{rem}$ (`8px` a `12px`).
3. **Gaps Inter-elementos:** Espaçamento entre cards de lista e linhas $\le 0.2\text{rem}$ a $0.5\text{rem}$ (`4px` a `8px`).
4. **Eliminação de Ar Morto:** Não use paddings externos gigantes (> 2rem) que empurrem o conteúdo para fora da dobra inicial.

### 📱 Padrão Mobile-First & Touch Targets ($\ge 44\times 44\text{px}$)
- Todo elemento interativo (botões, switches, ícones clicáveis, links e checkboxes) DEVE possuir uma área de toque ativa $\ge 44\times 44\text{px}$ no mobile, mesmo que sua representação visual gráfica seja compacta.
- Em telas menores que $768\text{px}$, modais de ação rápida devem se converter em **Bottom Drawers** suaves, facilitando o uso com uma só mão.
- **Proibição de Scroll Horizontal:** Nenhum elemento ou tabela pode causar overflow-x no body (`width: 100%`, `overflow-x: hidden` no layout raiz, com tabelas envelopadas em containers com scroll horizontal dedicado).

### 🍱 Bento Grids Fluidos
Utilize grids responsivos automáticos com `clamp()` tipográfico:
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
gap: 0.75rem;
```

---

## ⚛️ 3. Arquitetura React 18 & Padrões de Código

### 📦 Stack Oficial do Repositório
- **Runtime & Build:** React 18 + Vite.
- **Estilização:** `styled-components` ou classes utilitárias com tokens centralizados.
- **Roteamento:** `react-router-dom` v6 com rotas protegidas (`<PermissionRouteGuard page="...">`).
- **Comunicação API:** Cliente centralizado `src/services/api.js` (com injeção transparente de `Authorization: Bearer <token>` armazenado na chave `'bh_auth'`).
- **Ícones:** Estritamente `lucide-react` (com `size={18}` a `20` e `strokeWidth={1.75}`).

### 🚫 Proibição de Emojis como Ícones de Interface
- **NUNCA** utilize emojis (🎨, ⚙️, 🚀, ❌, ✅) como ícones gráficos em botões ou navegação de produção.
- Utilize exclusivamente componentes SVG limpos de `lucide-react` (`<Settings size={18} />`, `<Check size={18} />`, `<X size={18} />`, `<Shield size={18} />`).

### 🔌 Cliente de API Centralizado (`src/services/api.js`)
- **NUNCA** execute `fetch()` direto desprotegido para rotas administrativas `/api/v1/*`.
- **NUNCA** busque tokens em chaves arbitrárias como `localStorage.getItem('token')`. Use sempre o cliente `api` ou `request()`.
- Em uploads com `FormData`, passe o objeto diretamente via `request(endpoint, { method: 'POST', body: formData })`.

---

## 🛡️ 4. UX User-First & Resiliência em Estados Assíncronos

### 🚫 Proibição de Flash de Layout / Early Return com Spinner
```tsx
// ❌ PROIBIDO: Causa salto de layout (layout shift) e destrói a percepção de velocidade
if (loading) {
  return <FullPageSpinner />;
}

// ✅ CORRETO: Renderiza esqueleto ou mantém layout estável com fallback contextual
return (
  <Container>
    <Header title="Gestão de Ingressos" />
    {loading && !data ? <SkeletonGrid count={4} /> : <Content data={data} />}
  </Container>
);
```

### 🔒 Bloqueio de Ações Assíncronas (Anti Double-Click)
Todo botão que dispara mutação de dados (salvar, pagar, excluir, emitir contrato, check-in) DEVE ser desabilitado e exibir estado de carregamento durante a execução:
```tsx
<LuxuryButton 
  onClick={handleSave} 
  disabled={isSubmitting}
  $variant="gold"
>
  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
  {isSubmitting ? 'Processando...' : 'Confirmar Inscrição'}
</LuxuryButton>
```

### 📭 Empty States Ricos e Contextuais
Nenhuma tabela, lista ou grid pode renderizar um container em branco quando não houver dados. Forneça sempre:
1. Ícone ilustrativo (`lucide-react`).
2. Título claro (ex: *"Nenhum ingresso encontrado"*).
3. Mensagem descritiva contextual.
4. Botão de ação direta (ex: *"Limpar Filtros"* ou *"Criar Primeiro Registro"*).

### 💬 Feedback por Toast Luxury com Link de Suporte
Ao capturar erros de autenticação, permissão RBAC ou requisições bloqueadas:
- Dispare Toast Luxury estilizado (`#11223A` com acento dourado).
- Forneça botão/link direto para o WhatsApp oficial de suporte (`wa.me/5518996959486`).

---

## ⚡ 5. Otimização de Performance & Anti-Patterns

### 🚀 Diretrizes de Performance
1. **Lazy Loading:** Telas pesadas, editores WYSIWYG, gráficos e visualizadores de PDF devem ser carregados sob demanda via `React.lazy(() => import(...))`.
2. **Handlers Estáveis:** Event handlers passados para componentes filhos em listas devem ser encapsulados em `useCallback`.
3. **Cálculos Pesados:** Filtros complexos e somatórios de transações devem utilizar `useMemo`.
4. **Debounce em Buscas:** Campos de busca em tempo real devem aplicar debounce de `300ms` a `400ms`.

---

## 📋 6. Checklist de Validação Pré-Entrega (Quality Gate)

Antes de considerar qualquer componente ou página concluída, verifique:

- [ ] **Paleta Oficial:** Utiliza Navy Blue (`#0A3E60`), Gold (`#ED7E13`) e superfícies Luxury (`#11223A`), sem cores puras do navegador.
- [ ] **Ícones Limpos:** Zero emojis utilizados como ícones; uso exclusivo de `lucide-react`.
- [ ] **Ergonomia e Viewport:** Menu/topo cabe em tela vertical $\le 800\text{px}$; margem de logos $\le 1\text{rem}$; padding de itens $\le 0.75\text{rem}$.
- [ ] **Touch Targets:** Botões e áreas interativas $\ge 44\times 44\text{px}$ no mobile.
- [ ] **Zero Layout Shift:** Sem spinners de tela inteira com retorno antecipado; uso de Skeletons e containers estáveis.
- [ ] **Proteção Double-Click:** Botões de envio possuem `disabled={loading}` e feedback visual imediato.
- [ ] **API Client Seguro:** Requisições utilizam `api.js` (ou `request()`) com autenticação `'bh_auth'` e tratamento `catch` adequado.
- [ ] **Empty States:** Todas as listas possuem tratamento visual gracioso quando vazias.
- [ ] **Responsividade:** Testado e fluido em $360\text{px}$, $768\text{px}$, $1024\text{px}$ e $1440\text{px}$, sem scroll horizontal.

---

## 📐 7. Componentes Primitivos Globais de UI (`src/components/ui/`)

Toda tela administrativa, painel ou listagem deve herdar os 4 blocos primitivos do ecossistema:

### 1. `ResponsiveDataTable.jsx`
Tabela desktop densa com cabeçalhos `whitespace-nowrap` e auto-conversão para **Stacked Cards** em tablets e mobile ($\le 1024\text{px}$):
```tsx
import ResponsiveDataTable from '../../../components/ui/ResponsiveDataTable';

const columns = [
  { key: 'name', label: 'Nome', isTitle: true, truncate: true, maxWidth: '200px' },
  { key: 'email', label: 'E-mail', truncate: true, maxWidth: '220px' },
  { key: 'status', label: 'Status', isBadge: true, render: (val) => <Badge>{val}</Badge> },
  { key: 'actions', label: 'Ações', isAction: true, render: (_, row) => <Actions row={row} /> }
];

<ResponsiveDataTable
  columns={columns}
  data={items}
  keyExtractor="id"
  emptyTitle="Nenhum registro encontrado"
  emptyMessage="Utilize o botão acima para adicionar o primeiro item."
/>
```

### 2. `CompactKpiGrid.jsx`
Grid de KPIs auto-adaptativo `minmax(180px, 1fr)` com altura contida ($\le 90\text{px}$):
```tsx
import CompactKpiGrid from '../../../components/ui/CompactKpiGrid';
import { Users, DollarSign, CheckCircle2 } from 'lucide-react';

const kpis = [
  { label: 'Total Licenciadas', value: 42, color: '#0A3E60', icon: Users },
  { label: 'Faturamento', value: 'R$ 145.000', color: '#15803D', icon: DollarSign },
  { label: 'Ativas no Mês', value: 38, color: '#ED7E13', icon: CheckCircle2 }
];

<CompactKpiGrid items={kpis} />
```

### 3. `ScrollableTabs.jsx`
Navegação horizontal suave por abas com gradientes dinâmicos de borda e touch targets $\ge 44\text{px}$:
```tsx
import ScrollableTabs from '../../../components/ui/ScrollableTabs';
import { LayoutDashboard, Users, Settings } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Usuários', count: 12, icon: Users },
  { id: 'settings', label: 'Configurações', icon: Settings }
];

<ScrollableTabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### 4. `TableRowActionMenu.jsx`
Padroniza 1 ação primária em destaque (Gold/Navy) com menu suspenso contextual para ações secundárias:
```tsx
import TableRowActionMenu from '../../../components/ui/TableRowActionMenu';
import { Edit, Eye, Trash2, Key } from 'lucide-react';

<TableRowActionMenu
  primaryAction={{
    label: 'Editar',
    icon: Edit,
    variant: 'gold',
    onClick: () => handleEdit(row)
  }}
  secondaryActions={[
    { label: 'Visualizar', icon: Eye, onClick: () => handleView(row) },
    { label: 'Resetar Senha', icon: Key, onClick: () => handleReset(row) },
    { label: 'Excluir', icon: Trash2, danger: true, onClick: () => handleDelete(row) }
  ]}
/>
```

### 5. `ResponsiveModal.jsx`
Modal universal com backdrop blur Luxury (`rgba(10, 62, 96, 0.7)`), cantos arredondados (`16px`) no Desktop e auto-conversão em **Bottom Drawer** no Mobile (`≤ 768px`) com alça de arrasto (*drag handle*), altura máxima dinâmica (`calc(100dvh - 24px)`), scroll suave e cabeçalho/rodapé sticky:
```tsx
import ResponsiveModal from '../../../components/ui/ResponsiveModal';

<ResponsiveModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Novo Registro"
  subtitle="Preencha os dados do formulário abaixo"
  maxWidth="lg"
  theme="luxury-dark"
  footer={
    <div className="flex justify-end gap-3 w-full">
      <button onClick={() => setIsOpen(false)}>Cancelar</button>
      <button onClick={handleSave} className="btn-gold">Salvar</button>
    </div>
  }
>
  <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* Campos do formulário com touch target >= 44px */}
  </form>
</ResponsiveModal>
```

---

## 🎟️ 8. Padrão de Precificação de Alta Conversão & Mega Highlight Box

Para seções de venda de ingressos, planos ou cursos:
1. **Estrutura em Dual Cards Luxury (`Experience` e `VIP Exclusive`)**:
   - Card Secundário: Foco em conteúdo científico, networking e investimento acessível.
   - Card Principal (VIP): Destaque mestre com borda metálica, pulso suave, badge de vagas limitadas e acesso aos bastidores.
2. **Mega Highlight Box de Crédito Integral**:
   - Destaque em gradiente dourado (`rgba(237, 126, 19, 0.15)` com borda fina dourada).
   - Título explícito: `🎁 R$ 1.497 DE CRÉDITO INTEGRAL`.
   - Copy de impacto: *"100% do valor do seu ingresso é convertido em desconto direto na sua adesão ao Licenciamento Body Harmony."*
3. **Resumo Comparativo ("Qual escolher?")**:
   - Box compacto de orientação no rodapé da seção, sintetizando a tomada de decisão entre aprendizado versus adesão à franquia com 100% de retorno em crédito.

---

## 🧭 9. Padrão Master-Detail Visual Studio para CMS & Editores Densos

Para painéis administrativos com 4 ou mais seções/módulos editáveis (como o CMS da Loja e Landing Pages):
1. **Navegador de Seções (Sidebar Lateral no Desktop `> 1024px` / Abas Deslizantes no Mobile `≤ 1024px`)**:
   - Lista vertical compacta de seções com numeração, ícones Lucide dedicados e badges de status de publicação em tempo real (`✓ Ativo` em verde / `Oculto` em vermelho).
   - Item ativo com destaque dourado (`#ED7E13`) e gradiente Navy Blue.
2. **Painel de Edição Central Focado**:
   - Exibe **apenas 1 seção por vez** na área central, eliminando rolagem contínua infinita e sobrecarga visual.
   - Cabeçalho com switch de publicação imediata (*Seção Ativa na Página*), botão de Live Preview e sub-abas:
     - **`📝 Textos & Copys`**: Grid responsivo de 2 colunas para inputs e textareas com hint de formatação (`**negrito**` e `*ouro:gradiente*`).
     - **`🎨 Tipografia & Design`**: Ajustes visuais de alinhamento (Esquerda, Centro, Direita), escalas de tamanho de fonte, pesos e espaçamentos.
3. **Barra Sticky Flutuante no Rodapé com Atalho `Ctrl+S`**:
   - Fixa na base da tela com backdrop blur escuro luxury (`rgba(10, 62, 96, 0.95)`).
   - Listener de teclado global para **`Ctrl+S` / `Cmd+S`** com gravação instantânea e prevenção do atalho nativo do navegador.
   - Indicador de status de alterações, atalhos para Live Preview imediato (`🖥️ Desktop` / `📱 Mobile 390px`) e botão primário Luxury `[ 💾 Salvar Copys (Ctrl+S) ]`.
4. **Dedicação Total de Espaço Vertical**:
   - Retração automática de grids de métricas/KPIs quando o usuário estiver em abas de estúdio ou edição visual.

---

## 📊 10. Tabela Densa Luxury & Sincronização Estrita de Catálogo

1. **Padrão Tabela Densa Luxury para Gestão**:
   - Em tabelas com muitos registros (como o Catálogo de Produtos do E-Shop ou Listagens de Pedidos), utilizar densidade ergonômica:
     - Padding vertical contido nas células (`th` e `td` com `padding: 0.55rem 0.85rem`).
     - Miniaturas compactas de imagem (`48x38px` com border-radius `6px` e hover de ação rápida).
     - Inputs de link direto de checkout compactos (`height: 30px`, font-size `0.78rem`).
     - Ações inline (Salvar, Editar, Excluir) sem quebra de linha.
2. **Catálogo como Fonte da Verdade Estrita**:
   - Landing pages públicas, seções de vendas e checkouts devem consumir os dados cadastrais (nome, preço, subtítulo e lista de benefícios) diretamente da entidade de produtos (`shop_products`).
   - É proibido duplicar ou manter dados de ingressos/produtos hardcoded em templates ou CMS de texto quando o catálogo já os armazena de forma estruturada.
3. **Lote Vigente com WebGL Fluid Shader**:
   - O lote ativo/em andamento deve ser exibido com destaque máximo através do `GoldenNebulaFluidShader`, enquanto os lotes futuros mantêm visual compacto e discreto para concentrar o foco do comprador na conversão imediata.



