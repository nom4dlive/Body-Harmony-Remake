import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4500, action }) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newToast = { id, title, message, type, duration, action };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((title, message, options = {}) => {
    return addToast({ title, message, type: 'success', ...options });
  }, [addToast]);

  const showError = useCallback((title, message, options = {}) => {
    return addToast({ title, message, type: 'error', duration: 6000, ...options });
  }, [addToast]);

  const showWarning = useCallback((title, message, options = {}) => {
    return addToast({ title, message, type: 'warning', ...options });
  }, [addToast]);

  const showInfo = useCallback((title, message, options = {}) => {
    return addToast({ title, message, type: 'info', ...options });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      
      {/* TOAST CONTAINER FLUTUANTE */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            let borderCol = 'border-[#ED7E13]/40';
            let bgCol = 'bg-slate-900/95';
            let IconComp = Info;
            let iconCol = 'text-[#ED7E13]';

            if (toast.type === 'success') {
              borderCol = 'border-emerald-500/40';
              IconComp = CheckCircle2;
              iconCol = 'text-emerald-400';
            } else if (toast.type === 'error') {
              borderCol = 'border-rose-500/40';
              IconComp = AlertCircle;
              iconCol = 'text-rose-400';
            } else if (toast.type === 'warning') {
              borderCol = 'border-amber-500/40';
              IconComp = AlertTriangle;
              iconCol = 'text-amber-400';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border ${borderCol} bg-[#0A3E60]/95 text-white shadow-2xl backdrop-blur-md relative overflow-hidden`}
              >
                <div className={`p-1 rounded-lg bg-slate-950/60 ${iconCol} flex-shrink-0 mt-0.5`}>
                  <IconComp className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0 pr-2">
                  {toast.title && <h5 className="font-bold text-xs text-white tracking-wide">{toast.title}</h5>}
                  {toast.message && <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed break-words">{toast.message}</p>}
                  
                  {toast.action && (
                    <button
                      onClick={() => {
                        toast.action.onClick?.();
                        removeToast(toast.id);
                      }}
                      className="mt-2 text-[10px] font-bold px-2.5 py-1 bg-[#ED7E13] hover:bg-[#ED7E13]/80 text-white rounded-lg transition-colors"
                    >
                      {toast.action.label || 'Ver'}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback gracioso se usado fora do provider
    return {
      showSuccess: (t, m) => console.log('[Toast Success]', t, m),
      showError: (t, m) => console.error('[Toast Error]', t, m),
      showWarning: (t, m) => console.warn('[Toast Warning]', t, m),
      showInfo: (t, m) => console.info('[Toast Info]', t, m),
      addToast: () => {},
      removeToast: () => {}
    };
  }
  return context;
}
