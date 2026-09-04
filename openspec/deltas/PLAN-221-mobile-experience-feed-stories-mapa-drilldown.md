# DELTA PLAN-221: Mobile Experience — Feed Unificado, Stories 15s, Tinder Flashcards & Drill-Down MindMap

## 🎯 Objetivo
Prover à licenciada uma experiência mobile ultra-responsiva, sem atrito cognitivo (TDAH-friendly), que funcione perfeitamente em telas pequenas e celulares modestos.

## 📦 Especificação de Componentes
1. `DrillDownMindMapViewer.jsx`: Renderização de nós por níveis hierárquicos com breadcrumb e perguntas 1-toque.
2. `StoriesProtocolViewer.jsx`: 5 lâminas verticais de 15s com barras de progresso automáticas.
3. `TinderFlashcardDeck.jsx`: Arraste lateral para fixação de parâmetros com feedback tátil.
4. `AlunaLessonPlayer.jsx`: Layout responsivo com sticky player no topo e feed contínuo estilo WhatsApp abaixo.

## 🔒 Critérios de Aceite
- Zero mocks.
- Minutagens clicáveis no feed saltam o vídeo.
- Exit Code 0 no `nexus_gate.ps1`.
- Deploy com HTTP 200 OK.
