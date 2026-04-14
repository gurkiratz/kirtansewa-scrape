import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && onCancel()}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-xs shadow-2xl animate-in">
        <div className="p-5">
          <h3 className="text-text-primary text-base font-semibold mb-2">{title}</h3>
          <p className="text-text-secondary text-sm leading-relaxed">{message}</p>
        </div>
        <div className="border-t border-border px-5 py-3 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full bg-white/10 text-text-secondary text-sm font-medium hover:bg-white/15 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-full bg-red-500/80 text-white text-sm font-medium hover:bg-red-500 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
