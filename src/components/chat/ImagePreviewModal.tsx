"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

export default function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  alt = "Image preview",
}: ImagePreviewModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
        aria-label="Close preview"
      >
        <X className="h-6 w-6" />
      </button>

      <img
        src={imageUrl}
        alt={alt}
        className="relative z-10 max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}
