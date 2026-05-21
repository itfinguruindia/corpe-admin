"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "@heroui/react";
import clsx from "clsx";

type DocxPreviewProps = {
  blob: Blob;
  title?: string;
  /** Scaled thumbnail for template cards */
  compact?: boolean;
  className?: string;
  onError?: () => void;
};

export default function DocxPreview({
  blob,
  title,
  compact = false,
  className,
  onError,
}: DocxPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onErrorRef = useRef(onError);
  const [loading, setLoading] = useState(true);

  onErrorRef.current = onError;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const render = async () => {
      setLoading(true);
      container.innerHTML = "";

      try {
        const { renderAsync } = await import("docx-preview");
        const arrayBuffer = await blob.arrayBuffer();
        if (cancelled) return;

        await renderAsync(arrayBuffer, container, container, {
          className: compact ? "docx docx-compact" : "docx",
          inWrapper: true,
          ignoreWidth: compact,
          ignoreHeight: compact,
          breakPages: !compact,
          renderHeaders: true,
          renderFooters: true,
        });
      } catch {
        if (!cancelled) onErrorRef.current?.();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void render();

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [blob, compact]);

  return (
    <div
      className={clsx(
        "relative h-full w-full overflow-hidden bg-white",
        compact && "docx-card-preview",
        className,
      )}
      aria-label={title}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
          <Spinner size="md" />
        </div>
      )}
      <div
        ref={containerRef}
        className={clsx(
          "h-full w-full overflow-auto",
          compact && "pointer-events-none",
        )}
      />
    </div>
  );
}
