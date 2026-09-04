# 🎨 Especificação: Homepage V2 Reboot (EzBody Style)

> **ID:** SPEC-HOME-V2-REBOOT
> **Status:** 🟡 DRAFT
> **Referência Visual:** `ez_body_referencia/Curso Personal Ezbody.mhtml`
> **Fonte de Texto:** `Estrategia_e_Pilares_Protocolo_Body_Harmony.md`

## 1. Objetivo Principal
Refatoração visual e estrutural COMPLETA da Homepage para espelhar a estética "Premium Dark/Gold" do site de referência (EzBody), utilizando os textos estratégicos e vídeos já fornecidos.

## 2. Diretrizes Visuais (EzBody Style)
- **Tema:** Fundo Preto Profundo (`#050505` ou `#0a0a0a`) com texturas sutis.
- **Acentos:** Dourado Metalizado (`#d4af37`) e Branco Puro.
- **Tipografia:** 
  - Títulos: Fonte Condensada/Impactante em CAIXA ALTA (ex: `Oswald`, `Teko` ou `Anton`).
  - Corpo: Sans-serif limpa e leve (ex: `Montserrat` ou `Roboto`).
- **Layout:** Seções bem delimitadas, uso agressivo de "Full Width" e imagens de alta qualidade.

## 3. Estrutura de Seções (Mapeada)

### 3.1 Header (Navbar)
- **Estilo:** Transparente absoluto no topo, fundo preto sólido ao rolar.
- **Itens:** Logo Dourado | HOME | O MÉTODO | MENTORIA | LICENCIADAS | CONTATO
- **CTA:** Botão "Área do Aluno" (Outline Dourado).

### 3.2 Hero Section (Impacto)
- **Fundo:** Vídeo de Background (Escuro/Overlay) ou Slideshow Ken Burns.
- **Conteúdo Centralizado:**
  - **Headline:** "O PROTOCOLO BODY HARMONY" (Fonte Gigante Dourada)
  - **Subheadline:** "RESULTADOS DE UMA SEMANA DE ACADEMIA EM UMA ÚNICA SESSÃO" (Branco, Caixa Alta).
  - **Descrição:** "Método revolucionário de eletroestimulação de alta performance com parâmetros fisiológicos específicos."
  - **CTA Principal:** "QUERO SER UMA LICENCIADA" (Botão Gold Sólido).

### 3.3 Seção "O Que é o Método?" (Vídeo + Texto)
- **Layout:** 2 Colunas.
- **Esquerda (Vídeo):** Player com `metodo_body_harmony` (Imgur).
- **Direita (Texto):** 
  - Título: "NÃO É APENAS 'CHOQUINHO'"
  - Texto: Explicação sobre parâmetros fisiológicos vs. correntes comuns.
  - Gatilhos: "Fisiologia Profunda", "Patente Registrada", "Segurança Total".

### 3.4 Seção "A Fundadora" (Josi Silva)
- **Design:** Foto Recortada (PNG) da Josi sobre fundo com textura.
- **Texto:**
  - Título: "QUEM CRIOU O MÉTODO?"
  - História: "De obesidade a campeã de fisiculturismo em 5 meses."
  - Autoridade: "Metodologia patenteada e validada juridicamente."
- **Vídeo (Opcional):** `boas_vindas_marina` ou similar como suporte.

### 3.5 Galeria de Resultados (Prova Social Técnica)
- **Estilo:** Grid "Antes vs Depois" estilo EzBody (Fotos lado a lado com tarja preta explicativa).
- **Dados:** Extrair do dataset existente.

### 3.6 Seção "Depoimentos" (Comunidade)
- **Estilo:** Carrossel Dark.
- **Conteúdo:** Vídeos extraídos dos links Imgur (`depoimento_adriana_leal`, etc).
- **Formato:** Card com vídeo vertical (Stories look) + Nome + Frase de impacto.

### 3.7 Footer (Rodapé)
- **Estilo:** Minimalista, Fundo Preto.
- **Conteúdo:** Links rápidos, Copyright, Redes Sociais.

## 4. Integração de Conteúdo (De `Estrategia...md`)
- **Gatilho de Ganância:** Incluir bloco sobre "Faturamento de R$ 120k em 4 meses".
- **Gatilho de Exclusividade:** "Licenciamento por região".

## 5. Tecnologias
- **Framework:** React + Styled Components.
- **Assets:** Imagens do servidor + Vídeos Imgur (via `ImgurPlayer`).
- **Animações:** `framer-motion` (Scroll reveal para tudo).
