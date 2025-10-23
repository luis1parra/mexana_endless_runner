'use client';

import {
  useEffect,
  type FormEvent,
  type ReactNode,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownIcon,
  CartIcon,
  CloseIcon,
  MailIcon,
  PlusCircleIcon,
  ReceiptIcon,
  UserIcon,
} from "../../assets/icons";
import {
  api,
  type ApiSessionResponse,
  type RegistrationPayload,
} from "../../services/api";

type RegistrationModalProps = {
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
    <div className={`${fieldContainerClass}`}>
      <span className="text-[#2450F0]">{icon}</span>
      {options ? (
        <div className="relative w-full">
          <select
            id={id}
            name={id}
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
          name={id}
          className={inputClass}
          placeholder={placeholder ?? label}
        />
      )}
    </div>
  </label>
);

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const [, base64] = result.split(",");
        resolve(base64 ?? result);
      } else {
        reject(new Error("No se pudo leer el archivo seleccionado."));
      }
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo seleccionado."));
    reader.readAsDataURL(file);
  });

const toNonEmptyString = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
};

const leftFields: InputFieldProps[] = [
  {
    id: "fullName",
    label: "Nombres y apellidos",
    placeholder: "Nombres y apellidos",
    icon: <UserIcon className="h-5 w-5" />,
  },
  {
    id: "email",
    label: "Correo electrónico",
    placeholder: "Correo electrónico",
    icon: <MailIcon className="h-5 w-5" />,
    type: "email",
  },
  {
    id: "username",
    label: "Nombre de usuario",
    placeholder: "Nombre de usuario",
    icon: <UserIcon className="h-5 w-5" />,
  },
  {
    id: "age",
    label: "Edad",
    placeholder: "Edad",
    icon: <UserIcon className="h-5 w-5" />,
    type: "number",
  },
  {
    id: "gender",
    label: "Género",
    placeholder: "Género",
    icon: <UserIcon className="h-5 w-5" />,
    options: [
      { label: "Femenino", value: "F" },
      { label: "Masculino", value: "M" },
      { label: "Otro", value: "O" },
      { label: "Prefiero no decirlo", value: "N" },
    ],
  },
];

const rightFields: InputFieldProps[] = [
  {
    id: "purchasePlace",
    label: "¿Dónde realizaste la compra?",
    placeholder: "¿Dónde realizaste la compra?",
    icon: <CartIcon className="h-5 w-5" />,
    options: [
      { label: "Supermercado", value: "supermercado" },
      { label: "Farmacia", value: "farmacia" },
      { label: "Tienda online", value: "online" },
      { label: "Otro", value: "otro" },
    ],
  },
  {
    id: "invoiceNumber",
    label: "Número de factura",
    placeholder: "Número de factura",
    icon: <ReceiptIcon className="h-5 w-5" />,
  },
];

export const RegistrationModal = ({ open, onClose }: RegistrationModalProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

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
      setAttachment(null);
      setSubmitError(null);
      setIsSubmitting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files?.length) {
      return;
    }

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setSubmitError("Sólo se permite subir una imagen en formato JPG o PNG.");
      setAttachment(null);
      event.target.value = "";
      return;
    }

    setSubmitError(null);
    setAttachment(file);
    event.target.value = "";
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    const getValue = (key: string) =>
      (formData.get(key)?.toString().trim() ?? "");

    const nombre = getValue("fullName");
    const correo = getValue("email");
    const nickname = getValue("username");
    const edadValue = Number(getValue("age"));
    const genero = getValue("gender");
    const lugarCompra = getValue("purchasePlace");
    const numeroFactura = getValue("invoiceNumber");

    if (!nombre || !correo || !nickname || !genero || !lugarCompra || !numeroFactura) {
      setSubmitError("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (!Number.isFinite(edadValue) || edadValue <= 0) {
      setSubmitError("Ingresa una edad válida.");
      return;
    }

    if (!attachment) {
      setSubmitError("Debes adjuntar la imagen de la factura.");
      return;
    }

    let fotoFactura = "";
    try {
      fotoFactura = await fileToBase64(attachment);
    } catch (error) {
      setSubmitError("No se pudo procesar la imagen de la factura.");
      return;
    }

    const payload: RegistrationPayload = {
      nombre,
      correo,
      nickname,
      edad: Math.trunc(edadValue),
      genero,
      lugar_compra: lugarCompra,
      numero_factura: numeroFactura,
      foto_factura: fotoFactura,
    };

    try {
      setIsSubmitting(true);
      const response = await api.register(payload);

      if (typeof response === "string") {
        const message = String(response).trim();
        setSubmitError(message || "No fue posible completar el registro.");
        return;
      }

      const nestedError =
        response.data && typeof response.data === "object"
          ? (response.data as { error?: unknown }).error
          : undefined;

      const possibleError =
        [response.error, nestedError].find(
          (message) => typeof message === "string" && message.trim().length > 0,
        ) ?? null;

      if (possibleError) {
        setSubmitError((possibleError as string).trim());
        return;
      }

      const nestedSuccess =
        response.data && typeof response.data === "object"
          ? (response.data as { success?: unknown }).success
          : undefined;

      if (response.success === false || nestedSuccess === false) {
        setSubmitError("No fue posible completar el registro.");
        return;
      }

      const sessionSource: ApiSessionResponse =
        response.data && typeof response.data === "object"
          ? { ...(response.data as ApiSessionResponse) }
          : response;

      const idUserGame = toNonEmptyString(sessionSource.id_user_game);
      const nicknameFromResponse = toNonEmptyString(sessionSource.nickname);
      const facturaFromResponse = toNonEmptyString(sessionSource.id_factura);

      if (idUserGame) {
        const session = {
          id_user_game: idUserGame,
          nickname: nicknameFromResponse ?? payload.nickname,
          id_factura: facturaFromResponse ?? payload.numero_factura,
        };

        try {
          window.localStorage.setItem("session", JSON.stringify(session));
        } catch {
          // Evita bloquear el flujo si el almacenamiento falla.
        }
      }

      onClose();
      // Navega al juego estático en public/ respetando basePath de Next
      // router.push("/game/index.html");
      router.push("/juego");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No fue posible completar el registro.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0B1E52]/70 px-4 py-8">
      <div className="relative w-full max-w-[980px] rounded-[40px] bg-white px-6 py-10 text-[#0F1F5B] shadow-[0_40px_80px_rgba(15,31,91,0.25)] md:px-12">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar registro"
          className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#2450F0] text-white transition hover:bg-[#1C3AD4]"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
        <h2 className="text-center text-3xl font-black text-[#2450F0] md:text-[34px]">
          Registrarse
        </h2>
        <form
          className="mt-10 grid gap-8 md:grid-cols-2 md:items-start"
          onSubmit={handleSubmit}
        >
          <div className="flex min-w-0 flex-col gap-5">
            {leftFields.map((field) => (
              <InputField key={field.id} {...field} />
            ))}
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            {rightFields.map((field) => (
              <InputField key={field.id} {...field} />
            ))}
            <div className="rounded-[28px] bg-[#F5F7FD] px-6 py-5 shadow-[inset_0_1px_2px_rgba(12,37,106,0.12)]">
              <p className="text-base font-semibold text-[#0B1E52]">
                Adjuntar foto de la factura
              </p>
              <p className="mt-1 text-sm text-[#4A5785]">
                Adjunta una sola imagen de la factura en buena resolución en
                formato JPG o PNG.
              </p>
              <input
                ref={fileInputRef}
                id="invoiceAttachments"
                type="file"
                className="sr-only"
                accept=".png,.jpg,.jpeg"
                onChange={handleFilesSelected}
              />
              <button
                type="button"
                onClick={handleAttachClick}
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#2450F0] hover:text-[#1C3AD4]"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Adjuntar foto
              </button>
              {attachment && (
                <ul className="mt-4 space-y-2 text-sm text-[#0B1E52]">
                  <li
                    className="flex items-center justify-between rounded-full bg-white px-4 py-2 shadow-[0_2px_6px_rgba(15,31,91,0.08)]"
                  >
                    <span className="truncate pr-3">{attachment.name}</span>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E1E7FB] text-[#2450F0] transition hover:bg-[#D2DBFA]"
                      aria-label={`Eliminar archivo ${attachment.name}`}
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  </li>
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
                  y envío, llamadas o mensajes.
              </span>
            </label>
          </div>
          <div className="md:col-span-2 flex flex-col items-center gap-4">
            {submitError && (
              <p className="text-sm font-semibold text-red-600 text-center">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`mx-auto flex w-full max-w-[240px] items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-[0_20px_40px_rgba(15,31,91,0.3)] transition ${isSubmitting ? "bg-[#1C3AD4]/70 cursor-not-allowed" : "bg-[#2450F0] hover:bg-[#1C3AD4]"}`}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Empezar a jugar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationModal;
