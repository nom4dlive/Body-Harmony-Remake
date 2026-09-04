# 📘 Body Harmony v6.0 - Manual do Sistema & Documentação Técnica

Bem-vindo à documentação oficial do ecossistema digital **Body Harmony**. Este documento serve como guia definitivo para navegação, administração e entendimento técnico da plataforma.

Nom4d_GodMode_2026

> *Versão Atual: v6.0 (Nexus Phase)*  
> *Última Atualização: Fevereiro 2026*

---

## 🌟 Visão Geral

O **Body Harmony Monolith** é uma plataforma Fullstack que integra três frentes principais:
1.  **Institucional & Vendas:** Vitrine do método, galeria de profissionais e venda de cursos (Protocolo 35).
2.  **Portal da Licenciada LMS:** Ambiente de ensino à distância para licenciadas.
3.  **Gestão & Segurança:** Ferramentas administrativas para controle total do conteúdo e segurança.

---

## 🧭 1. Navegação Pública (Frente de Loja)

A interface pública foi desenhada para alta conversão e estética premium ("Cyberpunk Clean").

### 🏠 Home & Institucional
- **Landing Page:** Apresentação do método com design responsivo.
- **Workshop (Protocolo 35):** Página de vendas dedicada com integração de checkout.
- **Mentores:** Bio e fotos da equipe técnica.

### 💎 Galeria de Licenciadas (`/licenciadas`)
Ferramenta de busca para potenciais clientes encontrarem profissionais certificadas.
- **Filtros Inteligentes:** Pesquisa rápida por Nome ou Cidade.
- **Ações Diretas:**
  - 🟢 **WhatsApp:** Inicia conversa direta sem salvar número.
  - 📸 **Instagram:** Link direto para o perfil profissional.
  - 📍 **Localização:** Exibe cidade/estado da profissional.

---

## 🔐 2. Portal da Licenciada (LMS)

Área restrita para licenciadas e profissionais em treinamento.

### 🔑 Acesso & Segurança
- **Login Único:** Acesso via CPF/Email e Senha.
- **Proteção de Sessão:** O sistema derruba sessões antigas se um novo login for detectado (Prevenção de compartilhamento de conta).
- **Rota:** `/portal` ou `/entrar`.

### 🎓 Funcionalidades
- **Dashboard do Aluno:** Visão geral do progresso.
- **Player de Aulas:** Streaming de conteúdo exclusivo.
- **Perfil:** Edição de dados pessoais e senha.

### 📜 Certificados & Progressão (Phase 4)
O sistema agora conta com regras de ensino para garantir a qualidade do aprendizado:
- **Ensino Estruturado:** Você só pode acessar o Módulo 2 após ser aprovada no Quiz do Módulo 1.
- **Certificados Automáticos:** Ao concluir 100% de um módulo e passar na avaliação, um botão **"Baixar Certificado"** aparecerá automaticamente no topo da aula ou no dashboard.
- **Validação:** Cada certificado possui um código único verificável pela administração.

---

## 🛠️ 3. Painel Administrativo (`/admin`)

O "Cockpit" para gestão do conteúdo do site. Acesso restrito a gestores.

### 📝 Gestores de Conteúdo
- **Textos & FAQs:** Edite textos do site sem tocar em código.
- **Imagens:** Upload e gestão da galeria de resultados e fotos de mentores.
- **Depoimentos:** Aprovação e edição de depoimentos de licenciadas.

### 👥 Gestão de Pessoas
- **licenciadas:** Cadastro, edição e bloqueio de acesso de licenciadas.
- **Mentores:** Atualização de equipe.
- **Leads:** Visualização de interessados capturados pelo site.

---

## 👁️ 4. Nexus Dashboard (Superadmin)

> **⚠️ Acesso Restrito: Nível GOD MODE**

O Nexus (`/nexus`) é o núcleo de defesa e monitoramento técnico do sistema. Interface inspirada em terminais cyberpunk para máxima eficiência.

### 🗼 Watchtower (Torre de Vigia)
- **Monitoramento de Sessões:** Quem está logado AGORA.
- **Kill Switch:** Derrube sessões suspeitas com um clique.
- **IP Tracking:** Rastreio de endereços IP para detectar acessos indevidos.

### ⚔️ Barracks (Quartel General)
- **User Grid:** Lista técnica de usuários com metadados (Device Fingerprint).
- **Ghost Mode 👻:** Permite que o Admin logue como qualquer licenciada para ver exatamente o que ela vê (Debugging).
- **Ban Hammer:** Bloqueio instantâneo e revogação de licença.

### ⚙️ Engine Room (Casa de Máquinas)
- **Terminal de Logs:** Visualização em tempo real do arquivo `system.log` e `error_log` do servidor.
- **Diagnóstico:** Uso de Memória, Versão do PHP e Espaço em Disco da Hostinger.

---

## 💻 5. Ficha Técnica (Tech Stack)

O projeto utiliza uma arquitetura **Híbrida Monolítica** moderna, otimizada para a infraestrutura da Hostinger.

### 🎨 Frontend (Interface)
- **Core:** React 18
- **Build Tool:** Vite 6 (Performance extrema)
- **Estilização:** Styled Components (CSS-in-JS) + Framer Motion (Animações)
- **Ícones:** Lucide React (Vetores otimizados)
- **Roteamento:** React Router Dom v6

### 🧱 Backend (Servidor)
- **Linguagem:** PHP 8.x (Nativo/Vanilla) - Sem frameworks pesados para máxima velocidade.
- **API:** RESTful JSON Endpoints.
- **Banco de Dados:** MySQL (Relacional).
- **Uploads:** Gestão de arquivos locais com sanitização de nomes.

### 🛡️ Segurança & Infraestrutura
- **Hospedagem:** Hostinger Premium (Linux).
- **Autenticação:** Tokens JWT Customizados + Session Database Tracking.
- **DRM Lite:** Proteção contra download simples de vídeos e PDFs.
- **Anti-Sharing:** Bloqueio de múltiplas sessões simultâneas por usuário.

---

## 📞 Suporte & Troubleshooting

### Problemas Comuns
| Sintoma | Solução Provável |
| :--- | :--- |
| **Site não carrega atualizações** | Limpe o cache do navegador (`Ctrl + Shift + R` ou Ajustes do Celular). |
| **Erro de Login** | Verifique se não há espaços em branco no CPF/Email. |
| **Tela Branca** | Verifique a conexão de internet ou contate o suporte (pode ser manutenção). |

### Contato Técnico
Para bugs, erros de servidor ou dúvidas de acesso Nexus:
- **Responsável:** Equipe de Desenvolvimento (Agent Antigravity)
- **Canal:** Chat de Suporte Técnico / GitHub Issues.

---

*Documentação gerada automaticamente via Agent Antigravity.*
*© 2026 Body Harmony. Todos os direitos reservados.*
