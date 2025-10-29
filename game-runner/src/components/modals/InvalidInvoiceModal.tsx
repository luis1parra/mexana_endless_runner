'use client';

import { useEffect, useId } from "react";
import { ErrorLoupe } from "@/assets/icons";

type InvalidInvoiceModalProps = {
  open: boolean;
  onBackToStart: () => void;
  onClose?: () => void;
};

const MagnifierCrossIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 96 96" className="h-20 w-20 text-white/90">
    <path
      d="M60.4 56.2a25.5 25.5 0 1 0-4.2 4.2l14.2 14.2a3 3 0 0 0 4.2-4.2Zm-18.9 2.4a19.5 19.5 0 1 1 0-39 19.5 19.5 0 0 1 0 39Z"
      fill="currentColor"
    />
    <path
      d="m47.3 37.5 3.4-3.4a3 3 0 1 0-4.2-4.2l-3.4 3.4-3.4-3.4a3 3 0 0 0-4.2 4.2l3.4 3.4-3.4 3.4a3 3 0 0 0 4.2 4.2l3.4-3.4 3.4 3.4a3 3 0 1 0 4.2-4.2Z"
      fill="currentColor"
    />
  </svg>
);

export function InvalidInvoiceModal({
  open,
  onBackToStart,
  onClose,
}: InvalidInvoiceModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !onClose) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 px-4 py-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-[520px] rounded-[40px] bg-[#2450F0] px-8 py-12 text-center text-white shadow-[0_45px_90px_rgba(12,35,106,0.45)]"
      >
        {/* {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            aria-label="Cerrar mensaje"
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
        )} */}

        <div className="flex justify-center">
          <ErrorLoupe />
        </div>

        <h2
          id={titleId}
          className="mt-8 text-[26px] font-black leading-snug tracking-wide text-white md:text-[30px]"
        >
          Lamentablemente la factura que subiste no es válida
        </h2>

        <p
          id={descriptionId}
          className="mt-6 text-base leading-relaxed text-white/85 md:text-lg"
        >
          Por favor, asegúrate de que el archivo sea legible, esté en formato JPG, PNG
          o PDF, y contenga toda la información necesaria para su validación. Por esta
          razón, los puntos que acumulaste no podrán ser validados.
        </p>

        <button
          type="button"
          onClick={onBackToStart}
          className="cursor-pointer mt-10 inline-flex items-center justify-center rounded-full border border-white px-10 py-3 text-lg font-semibold text-white transition hover:bg-white/10"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
