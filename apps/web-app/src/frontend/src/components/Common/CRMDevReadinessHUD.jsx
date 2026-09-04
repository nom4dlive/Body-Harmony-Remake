import React, { useState, useEffect } from "react";
import { getRouteReadiness } from "../../config/readinessRegistry";

/**
 * 🏛️ CRMDevReadinessHUD — Visual Telemetry & Object Permanence
 * Traz as tarefas e pendências invisíveis de cada tela do CRM para o campo visual imediato.
 * Estilizado na identidade Luxury V4 (Deep Navy & Metallic Gold) com WCAG AAA.
 */
export function CRMDevReadinessHUD() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Escuta mudanças de histórico e cliques
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);

    const handleKeyDown = (e) => {
      // Atalho Ctrl+H ou Cmd+H para alternar visualização do HUD
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setIsExpanded((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const readiness = getRouteReadiness(currentPath);
  const pendingCount = readiness.pendingTasks?.length || 0;

  return (
    <aside
      aria-label="Nexus Readiness & Task HUD"
      className="fixed bottom-4 right-4 z-[9999] font-sans transition-all duration-300 ease-out"
      style={{
        fontFamily: "'Montserrat', 'Inter', sans-serif",
      }}
    >
      {/* 🟢 Floating Pill (Modo Compacto) */}
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-full shadow-lg border backdrop-blur-md cursor-pointer transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ED7E13]/50"
          style={{
            backgroundColor: "rgba(10, 62, 96, 0.95)",
            borderColor: "#ED7E13",
            color: "#FFFFFF",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25), 0 0 10px rgba(237, 126, 19, 0.3)",
          }}
          title="Clique ou pressione Ctrl+H para ver as tarefas desta tela"
        >
          {/* Indicador de Status Pulsante */}
          <span
            className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
            style={{ backgroundColor: readiness.level.dot }}
          />

          <span className="text-xs font-semibold tracking-wide text-[#FFFFFF]">
            {readiness.name}
          </span>

          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: "rgba(237, 126, 19, 0.25)",
              color: "#FFB366",
              border: "1px solid #ED7E13",
            }}
          >
            {readiness.progress}%
          </span>

          {pendingCount > 0 && (
            <span className="flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-bold bg-[#EF4444] text-white rounded-full">
              {pendingCount}
            </span>
          )}

          <span className="text-[10px] text-slate-300 ml-0.5">👁️ Tarefas</span>
        </button>
      ) : (
        /* 📋 Expanded Drawer (Modo Painel de Dopamina) */
        <div
          className="w-80 sm:w-96 rounded-2xl shadow-2xl border overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-3"
          style={{
            backgroundColor: "#072B44",
            borderColor: "rgba(237, 126, 19, 0.4)",
            color: "#FFFFFF",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(237, 126, 19, 0.2)",
          }}
        >
          {/* Header do HUD */}
          <div
            className="px-4 py-3 flex items-center justify-between border-b"
            style={{
              backgroundColor: "rgba(10, 62, 96, 0.8)",
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: readiness.level.dot }}
              />
              <span className="text-sm font-bold text-[#FFFFFF] tracking-wide">
                {readiness.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-white/10">
                {readiness.connection}
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors text-xs font-bold cursor-pointer"
                title="Minimizar (Ctrl+H)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Barra de Progresso Visual */}
          <div className="w-full bg-slate-800 h-1.5">
            <div
              className="h-1.5 transition-all duration-500"
              style={{
                width: `${readiness.progress}%`,
                backgroundColor: readiness.progress >= 80 ? "#10B981" : "#ED7E13",
              }}
            />
          </div>

          {/* Conteúdo & Micro-Passos */}
          <div className="p-4 space-y-3.5 max-h-80 overflow-y-auto">
            {/* Próxima Ação Imediata (Destaque Dourado) */}
            <div
              className="p-2.5 rounded-xl border"
              style={{
                backgroundColor: "rgba(237, 126, 19, 0.12)",
                borderColor: "#ED7E13",
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#FFB366] mb-1">
                ⚡ Próximo Ponto de Entrada (&lt; 3 min)
              </div>
              <div className="text-xs font-medium text-slate-100 leading-relaxed">
                {readiness.nextAction}
              </div>
            </div>

            {/* Lista de Tarefas Pendentes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-300">
                  Tarefas Faltantes nesta Tela ({pendingCount})
                </span>
                <span className="text-[10px] text-[#FFB366]">Micro-Steps</span>
              </div>

              {pendingCount === 0 ? (
                <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-lg flex items-center gap-2">
                  <span>✅</span>
                  <span>Todos os critérios essenciais (80%+) estão validados nesta tela!</span>
                </div>
              ) : (
                <ul className="space-y-1.5 m-0 p-0 list-none">
                  {readiness.pendingTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-200 hover:border-[#ED7E13]/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        disabled
                        className="mt-0.5 rounded border-slate-600 accent-[#ED7E13]"
                      />
                      <span className="flex-1 leading-snug">{task.title}</span>
                      <span className="text-[10px] font-mono text-[#FFB366] bg-[#ED7E13]/10 px-1.5 py-0.5 rounded border border-[#ED7E13]/30 whitespace-nowrap">
                        {task.est}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Rodapé com Atalho de Teclado */}
          <div
            className="px-4 py-2 border-t flex items-center justify-between text-[10px] text-slate-400"
            style={{
              backgroundColor: "rgba(10, 62, 96, 0.5)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <span>Nexus Protocol V3.2 • TDAH Mode</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono">
              Ctrl+H
            </kbd>
          </div>
        </div>
      )}
    </aside>
  );
}
