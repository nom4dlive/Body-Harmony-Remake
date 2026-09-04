# 🎨 Especificação: Redesign da Homepage (Referência EZBody)

> **ID:** SPEC-HOME-REDESIGN-001  
> **Status:** ✅ APROVADO  
> **Data:** 21/01/2026  
> **Atualizado:** 21/01/2026 (Respostas da Josi)  
> **Referência:** [EZBody.com.br](https://ezbody.com.br/)

---

## 📌 Decisões Confirmadas

| Pergunta | Resposta da Josi |
|----------|------------------|
| Nome do método | **Protocolo Body Harmony** |
| Cursos presenciais? | Sim, mas datas variadas (divulgadas em redes sociais) |
| Blog no site? | ❌ **NÃO** - Sem blog |

---

## 1. 📋 Resumo Executivo

A Josi solicitou que o site Body Harmony seja reestruturado seguindo o **layout e distribuição de informações** do site EZBody (outro curso na área de estética corporal). Este documento mapeia as seções do EZBody e propõe equivalentes para o Body Harmony.

---

## 2. 🔍 Análise do Site de Referência (EZBody)

### 2.1 Estrutura de Seções Identificadas

| # | Seção EZBody | Descrição | Elementos |
|---|-------------|-----------|-----------|
| 1 | **Header** | Navbar fixa | Logo + Menu (Home, Encontre Sua Personal, Próximos Cursos, Fale Conosco) + Botão "Área Restrita" |
| 2 | **Hero** | Banner principal | Slideshow de 3 imagens (Ken Burns) + Logo grande + Título "O que é o EZBODY?" + Texto explicativo |
| 3 | **Próximos Cursos + Fundadora** | Seção dividida 50/50 | Esquerda: Agenda de cursos + CTA / Direita: Bio da criadora (Priscilla Araújo) |
| 4 | **Encontre Sua Personal** | CTA centralizado | Título + Ícone de busca + Link para página de licenciadas |
| 5 | **Blog** | Grid de artigos | 4 cards com imagem + título + resumo + "Leia mais" + Banner lateral |
| 6 | **Depoimentos** | Carrossel | Texto de depoimento + Foto circular + Nome + Profissão/Cidade |
| 7 | **Resultados** | Galeria de fotos | 3 imagens lado a lado (antes/depois implícito) |
| 8 | **Próximos Cursos (Agenda)** | Lista dinâmica | Cards com data/local dos cursos |
| 9 | **Footer** | Rodapé simples | Menu replicado + Copyright + Ícone Instagram |

### 2.2 Características de Design

- **Paleta de Cores:** Tons escuros (preto/cinza) com detalhes em dourado/amarelo
- **Tipografia:** Fontes modernas (Roboto, Teko, Poppins)
- **Efeitos:** Glassmorphism sutil, Ken Burns em imagens, transições suaves
- **Mobile:** Menu hambúrguer, layout empilhado
- **Forma de Divisão:** Wave/Brush dividers entre seções

---

## 3. 🔄 Mapeamento EZBody → Body Harmony

| Seção EZBody | Equivalente Body Harmony | Conteúdo Necessário | Status |
|--------------|-------------------------|---------------------|--------|
| Hero (O que é o EZBODY?) | **Hero (O que é o Protocolo Body Harmony?)** | Título + Texto explicativo do método | ⚠️ TEXTO PENDENTE |
| Priscilla Araújo (Bio) | **Josi Silva (Bio)** | Foto + Biografia da Josi | ⚠️ TEXTO + FOTO PENDENTE |
| Próximos Cursos | **CTA "Fale Conosco"** | Link para WhatsApp (datas via redes sociais) | ✅ SIMPLIFICADO |
| Encontre Sua Personal | **Encontre Sua Licenciada** | ✅ Já existe (mapa) | ✅ OK |
| Blog | ~~Blog~~ | ❌ **REMOVIDO** - Josi não quer blog | ❌ N/A |
| Depoimentos | **Depoimentos** | ✅ Já existe | ✅ OK |
| Resultados | **Galeria de Resultados** | ✅ Já existe | ✅ OK |
| Área Restrita | **Portal das Licenciadas** | ✅ Já existe | ✅ OK |

---

## 4. 📐 Proposta de Nova Estrutura (Homepage)

### SEÇÃO 1: Header (Navbar)
```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]    Home | Licenciadas | Cursos | Contato    [Área Restrita] │
└─────────────────────────────────────────────────────────────────┘
```

**Já existe:** ✅ Navbar atual atende

---

### SEÇÃO 2: Hero Principal
```
┌─────────────────────────────────────────────────────────────────┐
│                      [SLIDESHOW DE IMAGENS]                      │
│                   (Efeito Ken Burns / 3 fotos)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      [LOGO GRANDE]                        │   │
│  │         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                  │   │
│  │        "O QUE É O PROTOCOLO BODY HARMONY?"                │   │
│  │                                                           │   │
│  │    Um novo estilo de tratamento que utiliza [...]         │   │
│  │    Ideal para quem busca resultados visíveis [...]        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Conteúdo necessário:**
- [ ] Texto explicativo: "O que é o Body Harmony?" (2-3 parágrafos)
- [ ] 3 imagens de alta qualidade para slideshow

---

### SEÇÃO 3: Próximos Cursos + Fundadora (Split 50/50)
```
┌────────────────────────────┬────────────────────────────────────┐
│   📅 PRÓXIMOS CURSOS       │   👩‍⚕️ JOSELENE SILVA (JOSI)        │
│                            │                                   │
│   Fique atualizada sobre   │   [FOTO DA JOSI com background]   │
│   nossos cursos!           │                                   │
│                            │   Carioca, fundadora do método    │
│   [AGENDA DE CURSOS]       │   Body Harmony, especialista em   │
│                            │   estética corporal com X anos    │
│                            │   de experiência...               │
└────────────────────────────┴────────────────────────────────────┘
```

**Conteúdo necessário:**
- [ ] Biografia da Josi (300-500 palavras)
- [ ] Foto profissional da Josi (alta resolução)
- [ ] Datas dos próximos cursos (se aplicável)

---

### SEÇÃO 4: Encontre Sua Licenciada (CTA)
```
┌─────────────────────────────────────────────────────────────────┐
│                    🔍 ENCONTRE SUA LICENCIADA                    │
│                                                                  │
│                    [ÍCONE DE LOCALIZAÇÃO]                        │
│                                                                  │
│                 (Link para página de busca)                      │
└─────────────────────────────────────────────────────────────────┘
```

**Já existe:** ✅ Página de licenciadas funciona

---

### SEÇÃO 5: Blog/Artigos
```
┌─────────────────────────────────────────────────────────────────┐
│                           📝 BLOG                                │
│                      ━━━━━━━━━━━━━━━━━━                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐ │
│  │    [IMG]     │ │    [IMG]     │ │    [IMG]     │ │ BANNER  │ │
│  │   Título     │ │   Título     │ │   Título     │ │ LATERAL │ │
│  │   Resumo...  │ │   Resumo...  │ │   Resumo...  │ │         │ │
│  │ [Leia mais]  │ │ [Leia mais]  │ │ [Leia mais]  │ │         │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Conteúdo necessário:**
- [ ] 3-4 artigos de blog com imagens
- [ ] Tópicos sugeridos: Benefícios do método, Dicas de tratamento, Cases de sucesso

---

### SEÇÃO 6: Depoimentos
```
┌─────────────────────────────────────────────────────────────────┐
│                        💬 DEPOIMENTOS                            │
│                      ━━━━━━━━━━━━━━━━━━                          │
│                            ❝                                    │
│                                                                  │
│   "O Body Harmony foi um divisor de águas na minha carreira..." │
│                                                                  │
│                       [FOTO CIRCULAR]                           │
│                       Nome da Pessoa                            │
│                    Profissão - Cidade/UF                        │
│                                                                  │
│     [◀ ANTERIOR]                           [PRÓXIMO ▶]          │
└─────────────────────────────────────────────────────────────────┘
```

**Já existe:** ✅ Sistema de depoimentos funciona

---

### SEÇÃO 7: Resultados
```
┌─────────────────────────────────────────────────────────────────┐
│                    ✨ VEJA OS RESULTADOS                         │
│                      ━━━━━━━━━━━━━━━━━━                          │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│  │   [RESULTADO 1]  │ │   [RESULTADO 2]  │ │   [RESULTADO 3]  │ │
│  │   Antes/Depois   │ │   Antes/Depois   │ │   Antes/Depois   │ │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Já existe:** ✅ Galeria de resultados funciona

---

### SEÇÃO 8: Footer
```
┌─────────────────────────────────────────────────────────────────┐
│     Home | Licenciadas | Cursos | Contato                       │
│                                                                  │
│     Body Harmony © 2026 - Todos os direitos reservados         │
│                                                                  │
│                       [📷 Instagram]                            │
└─────────────────────────────────────────────────────────────────┘
```

**Já existe:** ✅ Footer atual atende (com ajustes de conteúdo)

---

## 5. ⚠️ Gaps Identificados

### 5.1 Conteúdo Faltante (Josi precisa fornecer)

| Item | Prioridade | Responsável |
|------|------------|-------------|
| Texto "O que é o Body Harmony?" (2-3 parágrafos) | 🔴 ALTA | Josi |
| Biografia da Josi (300-500 palavras) | 🔴 ALTA | Josi |
| Foto profissional da Josi | 🔴 ALTA | Josi |
| Datas de próximos cursos (se houver) | 🟡 MÉDIA | Josi |
| Artigos de blog (3-4 textos) | 🟢 BAIXA | Josi ou Copywriter |

### 5.2 Funcionalidades Faltantes (Desenvolvimento)

| Item | Prioridade | Esforço |
|------|------------|---------|
| Slideshow com Ken Burns no Hero | 🟡 MÉDIA | 2h |
| Seção "Próximos Cursos" dinâmica | 🟡 MÉDIA | 4h |
| Página de Blog | 🟢 BAIXA | 8h |
| Wave dividers entre seções | 🟢 BAIXA | 1h |

---

## 6. 🎯 Recomendações

### 6.1 Prioridade ALTA (Fazer Primeiro)
1. **Validar conteúdo com Josi** - Precisa dos textos e fotos antes de implementar
2. **Atualizar Hero** - Implementar slideshow com Ken Burns
3. **Criar seção "Sobre a Fundadora"** - Com bio e foto da Josi

### 6.2 Prioridade MÉDIA
4. **Implementar seção "Próximos Cursos"** - Se Josi confirmar que há cursos
5. **Redesenhar CTA "Encontre Sua Licenciada"** - Mais destaque visual

### 6.3 Prioridade BAIXA
6. **Implementar Blog** - Apenas se houver conteúdo
7. **Adicionar Wave Dividers** - Detalhe estético

---

## 7. 📝 Checklist de Conteúdo para Josi

Por favor, revise e forneça os seguintes itens:

### Sobre o Método
- [ ] **Título:** Como você chama o método? (Body Harmony / Protocolo 35 / outro?)
- [ ] **Descrição curta:** O que é o Body Harmony em 2-3 frases?
- [ ] **Descrição longa:** Texto explicativo de 2-3 parágrafos

### Sobre Você (Fundadora)
- [ ] **Nome completo:** Joselene Silva (confirmar)
- [ ] **Biografia:** 300-500 palavras sobre sua trajetória
- [ ] **Foto:** Foto profissional de alta qualidade
- [ ] **Credenciais:** Certificações, especializações, tempo de mercado

### Cursos/Turmas
- [ ] Você oferece cursos presenciais? (Sim/Não)
- [ ] Se sim: datas e locais dos próximos cursos
- [ ] Página de inscrição externa ou interna?

### Blog
- [ ] Deseja ter uma seção de blog? (Sim/Não)
- [ ] Se sim: temas sugeridos para artigos

### Imagens para Slideshow
- [ ] 3 fotos de alta qualidade (tratamentos, resultados, ambiente)

---

## 8. 🔗 Arquivos Relacionados

- Referência visual: `ez_body_referencia/Curso Personal Ezbody.mhtml`
- Homepage atual: `00_Hostinger/src/pages/Home/Home.jsx`
- Spec de arquitetura: `openspec/specs/01-architecture-v6.md`
- Spec do Editor Visual: `openspec/specs/02-visual-editor-master.md`

---

## 9. ✅ Próximos Passos

1. **Josi revisar** este documento e fornecer conteúdo faltante
2. **Aprovar** estrutura proposta
3. **Implementar** em fases (Alta → Média → Baixa prioridade)
4. **Testar** em staging antes de deploy

---

*Documento gerado pelo Antigravity Agent em 21/01/2026*
