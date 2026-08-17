'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}

export default function Modal({ open, onClose, title, children, wide }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* Marges reduites sous 640px : 24px de chaque cote coutent un sixieme
          de la largeur sur un telephone. */}
      <div className={`relative bg-dark-card border border-dark-border rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[92vh] sm:max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-2xl border-b border-dark-border bg-dark-card px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="min-w-0 truncate text-base font-bold text-white sm:text-lg">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="shrink-0 text-xl leading-none text-dark-muted hover:text-white"
          >
            &times;
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
