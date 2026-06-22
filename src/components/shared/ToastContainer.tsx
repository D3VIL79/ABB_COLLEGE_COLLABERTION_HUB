'use client';

import { usePlatformStore, ToastItem } from '@/store/usePlatformStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = usePlatformStore();

  const getIcon = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 hover:border-emerald-500/40';
      case 'error':
        return 'border-red-500/20 hover:border-red-500/40';
      case 'info':
      default:
        return 'border-blue-500/20 hover:border-blue-500/40';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className={`w-full bg-[#0d0d0d]/95 backdrop-blur-md border ${getBorderColor(
              toast.type
            )} rounded-xl p-4 flex items-start gap-3 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-colors`}
          >
            {getIcon(toast.type)}
            
            <div className="flex-grow space-y-0.5">
              <h4 className="text-xs font-bold text-white leading-tight">
                {toast.title}
              </h4>
              <p className="text-[11px] text-muted-foreground leading-normal font-sans">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full text-white/30 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
