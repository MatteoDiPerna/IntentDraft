import React, { createContext, useCallback, useContext, useState } from 'react';
import { cn } from '@/utils/cn';

type ToastMessage = { id: number; text: string };

const ToastContext = createContext<(text: string) => void>(() => undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastMessage[]>([]);

  const show = useCallback((text: string) => {
    const id = Date.now();
    setItems((prev) => [...prev, { id, text }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'rounded-md border bg-card px-4 py-3 text-sm shadow-lg max-w-sm',
            )}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
