# Portal Gestor - LMS Management

O Portal do Gestor permite a administração centralizada das licenciadas matriculadas e do conteúdo educacional (LMS).

## Gestão de licenciadas

### Endpoint
- **URL:** `/api/v1/gestor/lms/students`
- **Method:** `GET`
- **Auth:** Requer Token de Administrador (Bearer).

### Exemplo de Resposta (JSON)
```json
[
  {
    "id": 1,
    "name": "Maria Silva",
    "email": "maria@exemplo.com",
    "whatsapp": "11999999999",
    "is_active": true
  },
  {
    "id": 2,
    "name": "Ana Oliveira",
    "email": "ana@exemplo.com",
    "whatsapp": null,
    "is_active": false
  }
]
```

## Content Studio

A organização do conteúdo segue os pilares da marca Body Harmony.

### Estrutura de Módulos Sugerida
1. **Nossa História e Missão**: Onboarding emocional.
2. **Fundamentos da Eletroestimulação**: Base técnica.
3. **Protocolos de Tratamento e Ética**: Excelência operacional.
4. **Gamificação e Motivação**: Engajamento.

## 🏥 Mentoria Clínica (Doctor Harmony Oversight)
As gestoras e mentoras clínicas têm acesso ao inbox de supervisão do Doctor Harmony.
- **Review Loop:** Casos clínicos (fotos/áudios) enviados por licenciadas que resultarem em confiança < 75% são listados como pendentes.
- **Ação:** A mentora deve revisar o parecer da IA e fornecer uma orientação técnica superior, que é então enviada de volta à licenciada.

## 🏛️ Hub Jurídico & Gestão de Contratos (PLAN-036 / PLAN-037)
Módulo completo de emissão, personalização ad-hoc e coleta de assinaturas digitais com conformidade legal (Lei 14.063/2020 e MP 2.200-2/2001).
- **Rotas Frontend:**
  - `/portal-gestor/contratos`: Dashboard Bento Grid com contadores, busca, filtros e aba de **Modelos de Contrato** (6 categorias oficiais).
  - `/portal-gestor/contratos/novo`: Wizard assistido por abas, auto-complete de licenciadas, Live Preview e **Modo de Edição Livre WYSIWYG** (ReactQuill).
  - `/assinar/:signToken`: Página pública de assinatura digital mobile-first com desenho touch canvas.
- **Mensageria WhatsApp:** Modal interativo integrado para envio com 1 clique nos tons *💖 Acolhedor / Humanizado* ou *⚖️ Formal / Jurídico*.
- **Endpoints de API:** `/api/v1/admin/contracts/`, `/api/v1/admin/contracts/templates.php`, `/api/v1/contracts/sign.php`, `/api/v1/contracts/download.php`.

## Troubleshooting
- **Erro de Syntax (JSON):** Verifique se o servidor PHP não está emitindo `warnings` ou `notices` antes do output do controller.
- **401 Unauthorized:** Certifique-se de estar logado como administrador e enviando o cabeçalho `Authorization: Bearer <token>`.

## 🔄 Workflow Operations

### LMS Reset & Seed (/lms_reset_examples)
Operação de limpeza e recriação do ambiente de aprendizado para testes ou reinício de instância.

**Comando:** `/lms_reset_examples`
**Script:** `scripts/lms_reset_db.php`

**Ações:**
1.  **Soft Delete:** Desativa todos os módulos e aulas existentes (`is_active = 0`).
2.  **Seed:** Cria estrutura padrão de Curso:
    *   **Módulo 1:** Introdução (YouTube)
    *   **Módulo 2:** Fundamentos (YouTube + MP4)
    *   **Módulo 3:** Protocolos (MP4)

**Suporte Multiformato:**
O sistema suporta nativamente:
*   `youtube`: URLs externas (YouTube, Vimeo) renderizadas via ReactPlayer.
*   `hostinger`: Vídeos locais (MP4) renderizados via HTML5 Video protegido (DRM-Lite).
