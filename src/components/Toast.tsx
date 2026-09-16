import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 w-[340px] max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => {
        const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? AlertCircle : Info;
        const color =
          t.type === 'success' ? 'text-teal-600' : t.type === 'error' ? 'text-rose-600' : 'text-brand-600';
        return (
          <div
            key={t.id}
            className="card flex items-start gap-3 p-3.5 animate-fade-up shadow-card"
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
            <p className="flex-1 text-sm font-medium text-ink-800 leading-snug">{t.message}</p>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-ink-400 hover:text-ink-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
