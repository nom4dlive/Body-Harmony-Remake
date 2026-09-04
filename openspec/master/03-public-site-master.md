# 🌐 Especificação Master: Site Público e Conteúdo (v2.0)

> **ID:** SPEC-PUBLIC-MASTER
> **Status:** Ativo
> **Contexto:** Estrutura das páginas voltadas ao visitante (Lead).

---

## 1. Estrutura de Navegação (Sitemap)

### 1.1 Páginas Principais
- **Home (`/`):** Landing Page principal. Foco em conversão (Agendamento/WhatsApp).
- **Mentores (`/mentores`):** Bio do Dr. Ulisses e Josi Silva. Autoridade técnica.
- **Licenciadas (`/licenciadas`):** Buscador de clínicas credenciadas por Estado.
- **Resultados (`/resultados`):** Galeria de "Antes e Depois" com filtros.
- **Depoimentos (`/depoimentos`):** Prova social em vídeo e texto.
- **Contato (`/contato`):** Formulário de captação de Lead + Redirecionamento WhatsApp.

### 1.2 Páginas Legais
- **Política de Privacidade (`/politica`):** LGPD.
- **Termos de Uso (`/termos`):** Regras de serviço.

---

## 2. Componentes de Alta Conversão

### 2.1 Hero Section Dinâmico
- **Imagem/Vídeo de Fundo:** Gerenciável via Editor Visual.
- **Headline:** H1 Otimizado para SEO.
- **CTA Principal:** Botão em destaque (ex: "Quero Agendar").

### 2.2 Bento Grid (Benefícios)
- Layout em grid assimétrico (estilo Apple) para destacar benefícios chave:
    - Eletroestimulação 40x mais potente.
    - Supervisão Médica.
    - Resultados em 10 Sessões.
    - Tecnologia Exclusiva.

### 2.3 Galeria de Resultados (Compare)
- Slider "Antes x Depois" interativo.
- Filtros por região (Abdômen, Flancos, Glúteos).
- Database: Tabela `results`.

### 2.4 Prova Social (Trustbar e Depoimentos)
- **Trustbar:** "Mais de 5.000 vidas transformadas", "Presente em 10 estados".
- **Carrossel:** Cards com foto e texto de clientes reais.

---

## 3. SEO e Performance

### 3.1 Otimização On-Page
- **Meta Tags:** Gerenciadas via `React Helmet Async` + `site_config`.
- **Lazy Loading:** Todas as imagens abaixo da dobra (Hero) devem ter `loading="lazy"`.
- **Next-Gen Formats:** Uso preferencial de WebP para imagens.

### 3.2 Estrutura Semântica
H1 único por página, H2 para seções, uso correto de `<article>`, `<section>`, `<nav>`.

---

## 4. Integração com Leads (CRM Lite)
Todo formulário (`/contato` ou Modal) deve:
1. Validar inputs no frontend (Zod/Yup).
2. Enviar POST para `/api/leads.php`.
3. Salvar no banco MySQL (`leads`).
4. Redirecionar para o WhatsApp do comercial com mensagem pré-preenchida.
