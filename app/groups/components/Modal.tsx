"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
};

export default function Modal({
  open,
  title,
  description,
  children,
  onClose,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* overlay */}
      <button
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Fechar modal"
      />

      {/* panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b1f18]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="flex items-start justify-between gap-4 p-5 border-b border-white/10">
            <div className="min-w-0">
              {title && (
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-white/60">{description}</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
              aria-label="Fechar"
            >
              <X className="h-4 w-4 text-white/80" />
            </button>
          </div>

          <div className="p-5">{children}</div>

          {footer ? (
            <div className="p-5 border-t border-white/10 bg-white/[0.02]">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
