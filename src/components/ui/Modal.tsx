"use client";

import { useEffect, useRef, ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string; // 👈 parent-controlled width
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md:max-w-[70vw]", // 👈 default width
}: ModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  /* ── Animation helpers ── */
  const enter = () => {
    const overlay = overlayRef.current;
    const box = boxRef.current;
    if (!overlay || !box) return;

    overlay.style.animation =
      "backdropIn 280ms cubic-bezier(0.16,1,0.3,1) forwards";
    box.style.animation = "modalIn 380ms cubic-bezier(0.16,1,0.3,1) forwards";
  };

  const exit = (cb: () => void) => {
    const overlay = overlayRef.current;
    const box = boxRef.current;
    if (!overlay || !box) {
      cb();
      return;
    }

    overlay.style.animation = "backdropOut 220ms ease-in forwards";
    box.style.animation = "modalOut 220ms ease-in forwards";
    box.addEventListener("animationend", cb, { once: true });
  };

  /* ── ESC key + body scroll lock ── */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    if (isOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.addEventListener("keydown", handleEsc);

      requestAnimationFrame(() => requestAnimationFrame(enter));
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  /* ── Controlled close ── */
  const handleClose = () => {
    exit(onClose);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes backdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes backdropOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        @keyframes modalOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
          to {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
            filter: blur(2px);
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          ref={overlayRef}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          style={{ opacity: 0 }}
        />

        {/* Modal Box */}
        <div
          ref={boxRef}
          role="dialog"
          aria-modal="true"
          style={{ opacity: 0 }}
          className={`relative z-10 flex w-full max-w-full ${maxWidth}
            flex-col rounded-xl bg-white shadow-2xl max-h-[90vh]`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            <button
              onClick={handleClose}
              aria-label="Close modal"
              className="ml-auto rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-6 py-4 text-gray-700">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
