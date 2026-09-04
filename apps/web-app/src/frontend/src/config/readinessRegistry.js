/**
 * 🏛️ Body Harmony Nexus — Readiness & Object Permanence Registry
 * Centraliza o estado de prontidão (Readiness State), telemetria e micro-passos pendentes
 * para cada tela do sistema, trazendo o invisível para o campo visual imediato.
 */

export const READINESS_LEVELS = {
  STABLE: {
    label: "80%+ Estável & Validado",
    tone: "success",
    bg: "#D1FAE5",
    text: "#065F46",
    border: "#10B981",
    dot: "#10B981",
  },
  IN_PROGRESS: {
    label: "Em Refatoração Ativa",
    tone: "warning",
    bg: "#FEF3C7",
    text: "#92400E",
    border: "#F59E0B",
    dot: "#F59E0B",
  },
  PENDING: {
    label: "Mock / Pendências Críticas",
    tone: "danger",
    bg: "#FEE2E2",
    text: "#991B1B",
    border: "#EF4444",
    dot: "#EF4444",
  },
};

export const ROUTE_READINESS_MAP = {
  "/admin/crm": {
    name: "CRM Cockpit V4 (Omnichannel)",
    level: READINESS_LEVELS.STABLE,
    progress: 95,
    connection: "Live API + WebSockets",
    pendingTasks: [],
    nextAction: "Pronto para operação com navegação por hash e fluidez Wago",
  },
  "/admin/whatsapp": {
    name: "WhatsApp Gateway Console",
    level: READINESS_LEVELS.IN_PROGRESS,
    progress: 75,
    connection: "Wago / Baileys Bridge",
    pendingTasks: [
      { id: "wa-1", title: "Adicionar card de Saúde da Conta (Reachout Time Lock)", est: "5 min" },
      { id: "wa-2", title: "Implementar diagnóstico inline de entrega de Webhooks", est: "4 min" },
    ],
    nextAction: "Transpor padrão de pairing SVG e modal de rebind do Wago",
  },
  "/admin/alunas": {
    name: "Gestão de Alunas & Licenciadas",
    level: READINESS_LEVELS.STABLE,
    progress: 90,
    connection: "PHP 8.4 REST v1",
    pendingTasks: [
      { id: "al-1", title: "Revisar contraste de badges de certificação em dark mode", est: "3 min" },
    ],
    nextAction: "Verificar exportação de dossiê em PDF",
  },
  "/admin/financeiro": {
    name: "Módulo Financeiro & e-Rede",
    level: READINESS_LEVELS.IN_PROGRESS,
    progress: 80,
    connection: "e-Rede Pix Gateway",
    pendingTasks: [
      { id: "fin-1", title: "Conectar webhook runner para simulação local de Pix", est: "3 min" },
      { id: "fin-2", title: "Adicionar feedback de cópia de chave Pix", est: "2 min" },
    ],
    nextAction: "Validar conciliação de pagamentos aprovados",
  },
  "/admin/gestor": {
    name: "Configurações & Gestor Cockpit",
    level: READINESS_LEVELS.STABLE,
    progress: 92,
    connection: "Nexus Core State",
    pendingTasks: [],
    nextAction: "Monitorar consumo de tokens e métricas gerais",
  },
};

/**
 * Resolve o estado de prontidão para o pathname atual.
 */
export function getRouteReadiness(pathname = "/") {
  const normalizedPath = Object.keys(ROUTE_READINESS_MAP).find((route) =>
    pathname.startsWith(route)
  );

  if (normalizedPath) {
    return ROUTE_READINESS_MAP[normalizedPath];
  }

  return {
    name: pathname === "/" ? "Dashboard Principal" : pathname,
    level: READINESS_LEVELS.STABLE,
    progress: 80,
    connection: "REST / Local Cache",
    pendingTasks: [],
    nextAction: "Tudo operando normalmente nesta tela",
  };
}
