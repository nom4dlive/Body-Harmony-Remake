# 🏠 05-Homepage-Master (v6.0)

> **Status:** Active / Source of Truth
> **Reference:** EZBody Style (Premium Dark/Gold)
> **Consolidated from:** `05-homepage-redesign-ezbody-ref` & `06-homepage-v2-reboot`

---

## 1. Visão Geral
A Homepage do Body Harmony deve transmitir **autoridade, luxo e resultados técnicos**. A estética segue o padrão "Premium Dark" com acentos em Dourado (`#ED7E13`) e Azul Profundo (`#0A3E60`), abandonando layouts genéricos de clínicas de estética.

### Diretrizes Visuais (Identity V3)
- **Fundo:** Predominância de Branco/Off-White (`#F5F5F5`) para "Clean" ou Azul Profundo (`#0A3E60`) para seções de impacto. *Nota: A Identity V3 mudou o foco do "Dark Mode" absoluto para um "Professional Blue".*
- **Tipografia:** `Bison Bold` (Títulos) e `Montserrat` (Corpo).
- **Vibe:** Tecnológica, Científica, Premium.

---

## 2. Estrutura de Seções

### 2.1. Hero Section (A Promessa)
- **Componente:** `HeroV3.jsx`
- **Conteúdo:**
  - **Manchete:** "O PROTOCOLO BODY HARMONY" (Bison, Grande).
  - **Subtítulo:** "Resultados de uma semana de academia em uma única sessão."
  - **Background:** Vídeo ou Slideshow com efeito Ken Burns (Imagens de alta performance).
  - **CTA:** "QUERO SER UMA LICENCIADA" (Botão Secundário - Laranja).

### 2.2. A Metodologia ("Não é choquinho")
- **Layout:** Split Screen (Vídeo à esquerda, Texto à direita).
- **Vídeo:** Explicação técnica do método.
- **Copy:** Focar na **fisiologia** e nos parâmetros proprietários. Diferenciação de eletroestimulação comum.

### 2.3. A Fundadora (Joselene Silva - Josi)
- **Design:** Foto profissional recortada (PNG) sobre fundo texturizado.
- **Storytelling:** "De obesidade a campeã de fisiculturismo".
- **Autoridade:** Patente registrada, validação jurídica.

### 2.4. Prova Social (Galeria de Resultados)
- **Componente:** `ResultsGallery.jsx`
- **Estilo:** Cards "Antes e Depois" com tarja explicativa.
- **Dados:** `DataContext.jsx` (Dataset mestre).

### 2.5. Depoimentos (Vídeos)
- **Estilo:** Carrossel tipo "Stories" (Vertical).
- **Conteúdo:** Licenciadas contando sobre o faturamento e resultados.

### 2.6. Localizador (Encontre sua Licenciada)
- **Componente:** Mapa interativo ou Lista filtrável.
- **CTA:** "Encontre uma profissional certificada perto de você."

---

## 3. Conteúdo Estratégico

### Gatilhos Mentais
1.  **Ganância/Oportunidade:** "Faturamento de R$ 120k em 4 meses."
2.  **Exclusividade:** "Licenciamento por região limitada."
3.  **Segurança:** "Método Validado e Patenteado."
4.  **Cientificismo:** Uso de termos técnicos (Fisiologia, Parâmetros, Eletroestimulação de Alta Performance).

---

## 4. Implementação Técnica
- **Caminho:** `apps/web-app/src/pages/Home`
- **Componentes Chave:** `HeroV3`, `MethodSection`, `FounderSection`, `ResultsGallery`.
- **Assets:** Imagens em `apps/web-app/src/assets/images` (Source) ou via URLs remotas.

---

## 5. Histórico de Mudanças
- **v6.0 (Atual):** Consolidação V3 (Azul/Dourado). Refatoração de componentes legados.
- **v5.0:** Tentativa "Dark Mode" total (descontinuada por conflito com marca).
- **v4.0:** Layout antigo (Legacy).
