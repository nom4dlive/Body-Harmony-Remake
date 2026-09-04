# Portal Licenciada - Dashboard

## Visual Identity V3 Compliance

O Dashboard da Licenciada segue o protocolo de "Alta Performance e Luxo" da marca Body Harmony.

### Hero Section Background
A imagem de fundo deve vir do protocolo oficial (`Estrategia_e_Pilares_Protocolo_Body_Harmony.md`).

- **Imagem Atual:** `https://i.imgur.com/eBypfd7.jpg` (Horizontal oficial).
- **Estilo:** `background-size: cover; background-position: center;`
- **Overlay:** Gradiente linear do azul escuro oficial para transparente para garantir legibilidade dos textos.

### Cores Principais
- **Fundo:** `#0A3E60` (Variações de Azul Escuro).
- **Destaques:** `#ED7E13` (Amarelo/Ouro).

## Componentes Integrados
- `ChangePasswordModal`: Acesso via Navbar (Segurança).
- `StatsWidgets`: Cálculo de progresso em tempo real baseado nos módulos ativos (4 cards estatísticos otimizados de alta performance).
- `AiCreditsWidget`: Exibição de saldo de créditos para avaliações clínicas do Doctor Harmony.
- `ClinicalEvaluation`: Interface multimodal para consultoria técnica via IA (fotos/áudios).

### Premium UI Layout (V22)
O Dashboard agora utiliza um layout de grade avançado:
- **Coluna Principal (Esquerda):** Carrosséis de módulos e aulas (Luxury Style).
- **Barra Lateral (Direita):** Widgets de inteligência Doctor Harmony e Monitor de Créditos.
- **Micro-interações:** Uso de `framer-motion` para transições suaves entre estados de análise da IA.

## Player de Vídeo (LMS)
O portal suporta reprodução híbrida com proteção de conteúdo:
- **YouTube/Vimeo**: Renderizados via `ReactPlayer`. URLs externas são detectadas automaticamente.
- **Local MP4 (Hostinger)**: Renderizados via HTML5 Video com proteção DRM-Lite.
  - Endpoint: `/api/lms/stream.php`
  - Segurança: Assinatura HMAC temporária (1h) + Validação de Token de Dispositivo (`X-Device-Token`).
  - Fallback: Mensagem amigável caso o vídeo esteja indisponível ou corrompido.

## Módulos Premium (PLAN-012)
Os módulos exclusivos que a licenciada ainda não possui acesso foram movidos e destacados em uma aba e página dedicadas:
- **Rota Dedicada:** `/portal-licenciada/premium` (`PremiumPage.jsx`)
- **Destaque na Dashboard:** `PremiumTeaserStrip` dourado e pulsante, exibido antes da listagem de carrosséis caso a licenciada possua módulos bloqueados.
- **Navegação Multicanal:**
  - **Desktop Navbar:** Link com badge pulsante dourado e efeito shimmer.
  - **Mobile Bottom Nav:** Aba dedicada "Premium" com ícone de estrela (`FaStar`) e dot pulsante dourado.
  - **Mobile Drawer:** Item em destaque dourado posicionado logo após o link de Início.
- **Página de Detalhes:** Lista os módulos restritos apresentando detalhes do conteúdo programático (aulas e durações) de forma expansível e botão para solicitação direta via WhatsApp enviando Nome e CPF do usuário logado.

