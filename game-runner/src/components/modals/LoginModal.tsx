'use client';

import {
  useEffect,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";
import {
  ArrowDownIcon,
  CartIcon,
  CloseIcon,
  MailIcon,
  PlusCircleIcon,
  ReceiptIcon,
} from "../../assets/icons";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

type InputFieldProps = {
  id: string;
  label: string;
  icon: ReactNode;
  placeholder?: string;
  type?: string;
  options?: Array<{ label: string; value: string }>;
};

const fieldContainerClass =
  "flex items-center gap-3 rounded-full bg-[#F5F7FD] px-5 py-3 shadow-[inset_0_1px_2px_rgba(12,37,106,0.12)]";
const inputClass =
  "w-full bg-transparent text-sm font-medium text-[#1A1A1A] placeholder:text-[#1A1A1A] focus:outline-none";

const InputField = ({
  id,
  label,
  icon,
  placeholder,
  type = "text",
  options,
}: InputFieldProps) => (
  <label className="flex flex-col gap-2 text-sm font-semibold text-[#0F1F5B]" htmlFor={id}>
    <span className="sr-only">{label}</span>
    <div className={fieldContainerClass}>
      <span className="text-[#2450F0]">{icon}</span>
      {options ? (
        <div className="relative w-full">
          <select
            id={id}
            className={`${inputClass} appearance-none pr-8`}
            defaultValue=""
          >
            <option value="" disabled>
              {placeholder ?? label}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ArrowDownIcon className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2450F0]" />
        </div>
      ) : (
        <input
          id={id}
          type={type}
          className={inputClass}
          placeholder={placeholder ?? label}
        />
      )}
    </div>
  </label>
);

const purchaseOptions = [
  { label: "Supermercado", value: "supermercado" },
  { label: "Farmacia", value: "farmacia" },
  { label: "Tienda online", value: "online" },
  { label: "Otro", value: "otro" },
];

export const LoginModal = ({ open, onClose }: LoginModalProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setAttachments([]);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files) {
      return;
    }

    setAttachments((prev) => {
      const known = new Set(prev.map((file) => `${file.name}-${file.size}`));
      const updated = [...prev];
      Array.from(files).forEach((file) => {
        const key = `${file.name}-${file.size}`;
        if (!known.has(key)) {
          known.add(key);
          updated.push(file);
        }
      });
      return updated;
    });
    event.target.value = "";
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0B1E52]/70 px-4 py-8">
      <div className="relative w-full max-w-[560px] rounded-[32px] bg-white px-6 py-9 text-[#0F1F5B] shadow-[0_40px_80px_rgba(15,31,91,0.25)] md:px-10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ingreso"
          className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#2450F0] text-white transition hover:bg-[#1C3AD4]"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
        <h2 className="text-center text-2xl font-black uppercase tracking-[0.12em] text-[#2450F0] md:text-[30px]">
          Tu proxima partida comienza aqui!
        </h2>
        <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
          <InputField
            id="loginEmail"
            label="Correo electronico"
            placeholder="Correo electronico"
            icon={<MailIcon className="h-5 w-5" />}
            type="email"
          />
          <InputField
            id="loginPurchasePlace"
            label="Donde realizaste la compra?"
            placeholder="Donde realizaste la compra?"
            icon={<CartIcon className="h-5 w-5" />}
            options={purchaseOptions}
          />
          <InputField
            id="loginInvoiceNumber"
            label="Numero de factura"
            placeholder="Numero de factura"
            icon={<ReceiptIcon className="h-5 w-5" />}
          />
          <div className="rounded-[28px] bg-[#F5F7FD] px-6 py-5 shadow-[inset_0_1px_2px_rgba(12,37,106,0.12)]">
            <p className="text-base font-semibold text-[#0B1E52]">
              Adjuntar foto de la factura
            </p>
            <p className="mt-1 text-sm text-[#4A5785]">
              Adjunta las fotos de la factura en buena resolucion en formato
              PNG, PDF y JPG.
            </p>
            <input
              ref={fileInputRef}
              id="loginAttachments"
              type="file"
              className="sr-only"
              multiple
              accept=".png,.jpg,.jpeg,application/pdf"
              onChange={handleFilesSelected}
            />
            <button
              type="button"
              onClick={handleAttachClick}
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#2450F0] hover:text-[#1C3AD4]"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Adjuntar fotos
            </button>
            {attachments.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm text-[#0B1E52]">
                {attachments.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between rounded-full bg-white px-4 py-2 shadow-[0_2px_6px_rgba(15,31,91,0.08)]"
                  >
                    <span className="truncate pr-3">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E1E7FB] text-[#2450F0] transition hover:bg-[#D2DBFA]"
                      aria-label={`Eliminar archivo ${file.name}`}
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <label className="flex items-start gap-3 text-sm text-[#0B1E52]">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border border-[#2450F0] accent-[#2450F0]"
            />
            <span>
              Autorizo el{" "}
              <span className="font-semibold">
                Tratamiento de Datos Personales
              </span>{" "}
              y envio, llamadas o mensajes.
            </span>
          </label>
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-full bg-[#2450F0] px-8 py-4 text-base font-semibold text-white shadow-[0_20px_40px_rgba(15,31,91,0.3)] transition hover:bg-[#1C3AD4]"
          >
            Ingresar al juego
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
