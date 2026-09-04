# 🗺️ Especificação: Mapa de Navegação e Rotas

**Status:** Active v2.0 (Nexus Era)
**Contexto:** Unificação da navegação (Navbar/Footer) com as páginas existentes do projeto.

## 🎯 Princípios
1. **Navegação Híbrida:** Suporte a âncoras na Home (`#`) e rotas absolutas (`/`).
2. **Visibilidade:** Todas as páginas públicas devem ser acessíveis pelo Menu Principal ou Rodapé.
3. **Consistência:** O mesmo link deve levar ao mesmo lugar no Topo e Rodapé.

## 🧭 Sitemap Oficial

### 1. Páginas Públicas Principais
| Página | Rota | Descrição | Status no Menu |
|--------|------|-----------|----------------|
| **Home** | `/` | Página inicial (Landing) | ✅ Principal |
| **O Método** | `/#metodo` | Seção na Home | ✅ Principal |
| **Resultados** | `/resultados` | Galeria completa de antes/depois | ✅ Principal |
| **Licenciadas** | `/licenciadas` | Lista de profissionais habilitadas | ✅ Principal |
| **Mentores** | `/mentores` | Equipe e mentoria | ✅ Secundário (Footer/Menu Mobile) |
| **Depoimentos** | `/depoimentos` | Prova social completa | ✅ Secundário (Footer/Menu Mobile) |
| **Contato** | `/contato` | Formulário e infos | ✅ Principal |

### 2. Páginas de Acesso Restrito
| Página | Rota |
|--------|------|
| **Portal Licenciada** | `/portal-licenciada` |
| **Portal Aluna Individual** | `/portal-aluna` |
| **Admin** | `/admin` |

### 3. Landing Pages Específicas
| Página | Rota |
|--------|------|
| **Protocolo 35** | `/protocolo-35` |

---

## 🧩 Estrutura do Menu (Navbar)

**Desktop:**
`Home` | `O Método` | `Resultados` | `Licenciadas` | `Contato` | `[CTA: Área do Aluno]`

**Mobile (Hambúrguer):**
1. Home
2. O Método
3. Resultados
4. Licenciadas
5. Mentores (Novo)
6. Depoimentos (Novo)
7. Contato
8. Área do Aluno (CTA)

## 🦶 Estrutura do Rodapé (Footer)

**Links Rápidos:**
- Início
- O Método
- Resultados (Rota `/resultados`)
- Licenciadas (Rota `/licenciadas`)
- Depoimentos (Rota `/depoimentos`)
- Mentores (Rota `/mentores`)
- Contato (Rota `/contato`)

---

## ⚠️ Regras de Implementação
- **Detecção de Rota:**
  - Se usuário está na Home: `/#metodo` faz scroll suave.
  - Se usuário está em `/contato`: `/#metodo` redireciona para `/` depois faz scroll.
- **Menu Mobile:** Deve listar TODAS as páginas, não apenas as principais.
