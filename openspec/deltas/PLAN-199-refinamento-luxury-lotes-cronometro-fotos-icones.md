# 🎯 PLAN-199: Refinamento Luxury — Lotes, Cronômetros em Linha Única, Fotos Sem Cortes e Ícones Contextuais

## [OBJETIVO]
Corrigir falhas de enquadramento de fotos, quebra de linha de cronômetros em telas mobile, refatorar a gestão de lotes com reordenação/cronômetros individuais e enriquecer a semântica visual com seletor de ícones e emojis no CMS Studio.

## [ESPAÇO NEGATIVO]
- Não alterar regras de autenticação, gateway de pagamento ou rotas da API.
- Não modificar estrutura de checkout do e-Rede/Pix.

## [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] 1. Ajustar `LuxuryPhotoWidget.jsx` para modo `contain` adaptativo com moldura Luxury e background sutil sem cortes.
- [ ] 2. Ajustar `CountdownSection.jsx` e `LotesRuler.jsx` para travar cronômetros rigorosamente em 1 linha única em qualquer resolução.
- [ ] 3. Implementar no `CongressoCmsTab.jsx` a lista dinâmica reordenável de lotes com Framer Motion (`Reorder`), personalização e cronômetro individual por lote.
- [ ] 4. Atualizar `LotesRuler.jsx` para ler a estrutura dinâmica de lotes com cronômetros individuais.
- [ ] 5. Implementar o seletor de ícones contextuais e emojis no CMS e integrar nas seções (`SobreSection.jsx`, `PorQueParticiparSection.jsx`, etc.).
- [ ] 6. Executar validação de build e `nexus_gate.ps1`.

## [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `apps/web-app/src/frontend/src/pages/Congresso/components/LuxuryPhotoWidget.jsx`
- `apps/web-app/src/frontend/src/pages/Congresso/sections/CountdownSection.jsx`
- `apps/web-app/src/frontend/src/pages/Congresso/components/LotesRuler.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/Shop/components/CongressoCmsTab.jsx`
- `apps/web-app/src/frontend/src/pages/Congresso/sections/SobreSection.jsx`
- `apps/web-app/src/frontend/src/pages/Congresso/sections/PorQueParticiparSection.jsx`
