# User Stories — Fluxos Principais

## US-01: Login como Licenciada
**Como** licenciada,  
**Quero** fazer login no sistema,  
**Para** acessar meu dashboard, aulas e resultados.

**Critérios de Aceitação:**
- Login com CPF/email + senha
- Dispositivo registrado com device_token
- Suporte a múltiplos dispositivos (limitado por max_devices, FIFO)
- Bloqueio após 5 tentativas falhas (15 min)
- Token JWT com prefixo específico por perfil

## US-02: Gerenciar Licenciadas (Admin)
**Como** admin,  
**Quero** cadastrar, editar e gerenciar licenciadas,  
**Para** controlar acesso ao sistema.

**Critérios de Aceitação:**
- Cadastro com foto, documentos e dados pessoais
- Senha padrão "Mudar123!" com força de troca
- CPF, Email e WhatsApp únicos
- Reset de lifecycle (senha, LGPD, dispositivos)
- Dashboard de progresso educacional

## US-03: Navegar no LMS (Licenciada)
**Como** licenciada,  
**Quero** acessar módulos e aulas do curso,  
**Para** estudar e evoluir na formação.

**Critérios de Aceitação:**
- Módulos bloqueados por progressão (strict progression)
- Aulas com vídeo (Vimeo/YouTube) e material de apoio
- Progresso salvo automaticamente (UPSERT)
- Quizzes com nota mínima para liberar próximo módulo

## US-04: Emitir Certificado
**Como** licenciada,  
**Quero** emitir meu certificado após aprovação no quiz,  
**Para** comprovar conclusão do módulo.

**Critérios de Aceitação:**
- Certificado só emitido se quiz aprovado (passed=1)
- PDF gerado sob demanda com hash SHA-256 único
- Download direto do navegador

## US-05: Mentor IA (Doctor Harmony)
**Como** licenciada,  
**Quero** enviar casos clínicos para análise da IA,  
**Para** receber orientação sobre procedimentos estéticos.

**Critérios de Aceitação:**
- Upload de foto + descrição do caso
- Análise por Gemini Vision com confiança (threshold 0.80)
- Detecção automática de crise (palavras de desistência)
- Revisão híbrida: confiança < 80% vai para mentor humano
- Controle de créditos de IA por licença

## US-06: Broadcast e Comunicados (Admin)
**Como** admin,  
**Quero** enviar comunicados para perfis específicos,  
**Para** informar licenciadas e alunas sobre avisos importantes.

**Critérios de Aceitação:**
- Broadcast com targeting por role (JSON target_roles)
- Tracking de leitura obrigatório
- Broadcasts bloqueantes (acknowledge obrigatório)
- Histórico de broadcasts lidos

## US-07: Firewall e Segurança (Nexus Admin)
**Como** admin de segurança,  
**Quero** gerenciar regras de firewall IP,  
**Para** proteger o sistema contra acessos maliciosos.

**Critérios de Aceitação:**
- Adicionar regras BAN/ALLOW/SUSPICIOUS por IP
- Duração configurável (expiração automática)
- Auditoria completa de todas as operações
- Guardian Feed com timeline de anomalias + ações admin

## US-08: Forense de Alunos (Nexus Admin)
**Como** admin de segurança,  
**Quero** investigar histórico de acesso de alunos,  
**Para** detectar compartilhamento de conta e fraudes.

**Critérios de Aceitação:**
- Busca por CPF com timeline completa
- Lookup por hash de dispositivo
- Geração batch de relatórios forenses
- Configuração de regras de detecção

## US-09: Dashboard de Resultados (Visitante)
**Como** visitante do site,  
**Quero** ver a galeria de resultados antes/depois,  
**Para** avaliar a eficácia do método.

**Critérios de Aceitação:**
- Galeria com imagens de transformação
- Ordenação: destaques (pinned) primeiro, depois por data
- Categorização por tipo de resultado

## US-10: Captura de Leads (Visitante)
**Como** visitante do site,  
**Quero** preencher formulário de contato,  
**Para** receber mais informações sobre o Body Harmony.

**Critérios de Aceitação:**
- Formulário com nome, email, WhatsApp e mensagem
- Sanitização automática contra XSS
- Status inicial 'new' para acompanhamento comercial
