import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-4 bg-black text-white border border-neutral-800 shadow-2xl rounded-none transition-all duration-300 animate-in slide-in-from-bottom-2"
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-neutral-200 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />}
          <div className="flex-1 text-sm font-normal text-neutral-200 leading-snug">{toast.message}</div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-neutral-400 hover:text-white transition-colors p-0.5"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
