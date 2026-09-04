# Implementação: Expansão do Editor Visual (Conteúdo Completo)

## Objetivo
Tornar 100% do conteúdo da Home Page editável através do painel `portal-gestor/visual-editor`. Atualmente, seções como "Rodapé CTA", "Barra Superior" e textos do Rodapé ("Textos Globais") não possuem campos de edição.

## Mudanças Propostas

### 1. `src/pages/Admin/VisualEditor/components/ContentTab.jsx`
Vamos adicionar novas opções no seletor e seus respectivos campos:

#### A. Rodapé CTA (`home_cta`)
Substituir o "🚧 Em breve" pelos campos:
- **Conteúdo**: Título, Subtítulo, Texto do Botão.
- **Estilo (Novo)**:
    - **Cor de Fundo**: `style.backgroundColor` (Color Picker)
    - **Cor do Texto**: `style.textColor` (Color Picker)
    - **Imagem de Fundo**: `style.backgroundImage` (URL)
    - **Visibilidade**: `visible` (Toggle)

#### B. Barra Superior (`topBar`) - [NOVO]
Adicionar nova opção "Barra de Aviso (Topo)" no seletor:
- **Ativar/Desativar**: `enabled` (Checkbox)
- **Mensagem**: `text`
- **Link**: `link`
- **Cor de Fundo**: `color` (Color Picker)
- **Cor do Texto**: `textColor` (Color Picker - Novo)

#### C. Textos Globais (`siteTexts`) - [NOVO]
Adicionar nova opção "Rodapé & Globais" no seletor para editar `siteTexts`:
- **E-mail de Contato**: `footerEmail`
- **Copyright**: `footerCopyright`
- **Títulos**: `contactTitle`, `aboutTitle`, `aboutDescription`
- **Estilo do Rodapé**: 
    - **Cor de Fundo**: `style.footerBackground` (Color Picker)
    - **Cor do Texto**: `style.footerText` (Color Picker)

## Plano de Verificação

### Automatizado
- Não aplicável (Testes de UI dependem de interação manual).

### Manual (Pelo Usuário)
1.  Acessar `/portal-gestor/visual-editor`.
2.  Na aba **Conteúdo**, selecionar "Rodapé CTA".
    - Alterar textos e verificar se reflete no Preview (fim da página).
3.  Selecionar "Barra de Aviso (Topo)".
    - Ativar, mudar cor e texto. Verificar se aparece no topo.
4.  Selecionar "Rodapé & Globais".
    - Mudar o Copyright e E-mail. Verificar no Rodapé.
5.  Clicar em **Salvar** e verificar persistência após recarregar.
