# 🎨 PLAN-203: Refinamento Visual de Elite do CRM (WhatsApp-Fidelity) & Transcrição Real Whisper

## 🎯 Objetivo
Transformar a experiência visual e funcional do CRM em um padrão de fidelidade idêntico ao WhatsApp Web profissional, eliminando balões soltos de reações emoji, renderizando citações e mensagens de grupo de forma sofisticada, limpando eventos de sistema, e conectando transcrição real de áudio via Whisper STT.

## 📋 Micro-Steps de Execução
- [ ] Passo 1 (Backend): Conectar Whisper API real em HermesAdvancedIntelligenceService.php.
- [ ] Passo 2 (Backend): Atualizar inbox_messages.php para filtrar/anexar reações e classificar eventos de sistema.
- [ ] Passo 3 (Frontend): Implementar parser de citações e remetentes de grupo com cores individuais em OmnichannelInbox.jsx.
- [ ] Passo 4 (Frontend): Criar componentes de ReactionPill e SystemEventDivider + fix de CSS no ChatHeader.
- [ ] Passo 5 (Build & Deploy): Compilar release com Vite e sincronizar via FTPS na Hostinger.
- [ ] Passo 6 (Verificação): Teste com conversas de grupo reais e áudio real em produção.
