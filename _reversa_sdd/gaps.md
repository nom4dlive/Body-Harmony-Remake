# Lacunas Identificadas — Body-Harmony-Remake

> Gerado pelo Revisor em 2026-06-02
> Categorizado por severidade: 🔴 Crítico, 🟡 Moderado, 🔵 Cosmético

---

## 🔴 Críticas

Lacunas que bloqueiam reimplementação fiel do sistema:

| ID | Módulo | Lacuna | Impacto |
|----|--------|--------|---------|
| G01 | conteudo | Estratégia de armazenamento de fotos não confirmada (local vs cloud) | Upload pode falhar em deploy cloud |
| G02 | certificado | Template do PDF não documentado | Reimplementação do layout impossível sem o template |
| G03 | midia | Diretório de armazenamento e tipos MIME permitidos não confirmados | Validação e armazenamento incorretos |
| G04 | broadcast | Mecanismo de blocking para is_blocking não detalhado | Comportamento bloqueante indefinido |

## 🟡 Moderadas

Lacunas que afetam a qualidade mas não bloqueiam reimplementação:

| ID | Módulo | Lacuna | Impacto |
|----|--------|--------|---------|
| G05 | certificado | Re-emissão de certificado para mesmo módulo não confirmada | Comportamento duplicado indefinido |
| G06 | broadcast | Expiração automática de broadcasts não confirmada | Limpeza de comunicados antigos |
| G07 | leads | Transições de status válidas não documentadas | Máquina de estados incompleta |
| G08 | leads | Notificação automática ao admin não confirmada | Fluxo comercial pode perder leads |
| G09 | workshop | URL de destino do CTA não documentada | Link de conversão quebrado |
| G10 | resultados | Integração com MediaController para upload não confirmada | Fluxo de upload de imagens |

## 🔵 Cosméticas

Lacunas de baixo impacto ou documentação:

| ID | Módulo | Lacuna | Nota |
|----|--------|--------|------|
| G11 | workshop | Conteúdo pode ser dinâmico via DataContext | Não confirmado, mas página funciona estática |
| G12 | faq | FAQs setoriais (por perfil) não confirmadas | Pode existir lógica não documentada |
| G13 | midia | Mecanismo de incremento de access_count não detalhado | Tracking de uso de mídia |
| G14 | certificado | Validação pública de hash_code (autenticidade) | Recurso avançado não confirmado |
| G15 | nexus | Permissões específicas por endpoint não documentadas | Matriz de RBAC incompleta |
