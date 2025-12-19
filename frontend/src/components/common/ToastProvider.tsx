import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  timeoutMs?: number;
};

type ToastContextValue = {
  pushToast: (t: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = uid();
    const toast: Toast = { id, timeoutMs: 3500, ...t };

    setToasts((prev) => [toast, ...prev].slice(0, 5));

    const ms = toast.timeoutMs ?? 3500;
    window.setTimeout(() => remove(id), ms);
  }, [remove]);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Stack */}
      <div className="fixed right-5 top-5 z-50 flex w-[360px] max-w-[90vw] flex-col gap-3">
        {toasts.map((t) => {
          const base =
            'rounded-xl border px-4 py-3 shadow-lg backdrop-blur transition-all';
          const variant =
            t.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100'
              : t.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100'
              : 'border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100';

          return (
            <div key={t.id} className={`${base} ${variant}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{t.title}</div>
                  {t.message && (
                    <div className="mt-1 text-sm opacity-90">{t.message}</div>
                  )}
                </div>

                <button
                  onClick={() => remove(t.id)}
                  className="rounded-lg px-2 py-1 text-xs font-semibold opacity-70 hover:opacity-100"
                  aria-label="Close toast"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
