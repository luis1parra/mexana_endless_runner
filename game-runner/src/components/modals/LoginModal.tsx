'use client';

import { useEffect, type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CartIcon, CloseIcon, MailIcon, PlusCircleIcon, ReceiptIcon } from "../../assets/icons";
import { api, type ApiSessionResponse } from "../../services/api";
import {
  InputField,
  type InputFieldOption,
} from "../form/InputField";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

const iconWrapperClass =
  "aspect-square shrink-0 self-stretch flex items-center justify-center text-[var(--cpdblue)] w-10 h-10 [&>svg]:h-[70%] [&>svg]:w-[70%]";
const purchaseOptions: InputFieldOption[] = [
  { label: "Supermercado", value: "supermercado" },
  { label: "Farmacia", value: "farmacia" },
  { label: "Tienda online", value: "online" },
  { label: "Otro", value: "otro" },
];

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

export const LoginModal = ({ open, onClose }: LoginModalProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataAuthorized, setIsDataAuthorized] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
      setIsDataAuthorized(false);
      setFieldErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleFieldValidationChange = (fieldId: string, error: string | null) => {
    setFieldErrors((prev) => {
      const normalized =
        typeof error === "string" && error.trim().length > 0 ? error.trim() : null;

      const hasExisting = Object.prototype.hasOwnProperty.call(prev, fieldId);

      if (normalized === null) {
        if (!hasExisting) {
          return prev;
        }
        const { [fieldId]: _removed, ...rest } = prev;
        return rest;
      }

      if (hasExisting && prev[fieldId] === normalized) {
        return prev;
      }

      return { ...prev, [fieldId]: normalized };
    });
  };

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const isSubmitDisabled = isSubmitting || !isDataAuthorized || hasFieldErrors;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    // router.push("/juego");

    const formData = new FormData(event.currentTarget);
    const getValue = (key: string) => formData.get(key)?.toString().trim() ?? "";

    const correo = getValue("loginEmail");
    const lugarCompra = getValue("loginPurchasePlace");
    const numeroFactura = getValue("loginInvoiceNumber");

    if (!correo || !lugarCompra || !numeroFactura) {
      setSubmitError("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (!attachment) {
      setSubmitError("Debes adjuntar la imagen de la factura.");
      return;
    }

    let fotoFactura = "";
    try {
      fotoFactura = await fileToBase64(attachment);
    } catch {
      setSubmitError("No se pudo procesar la imagen de la factura.");
      return;
    }

    const payload = {
      correo,
      lugar_compra: lugarCompra,
      numero_factura: numeroFactura,
      foto_factura: fotoFactura,
    };

    try {
      setIsSubmitting(true);
      const response = await api.login(payload);

      if (typeof response === "string") {
        const message = String(response).trim();
        setSubmitError(message || "No fue posible completar el ingreso.");
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
        setSubmitError("No fue posible completar el ingreso.");
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
          nickname: nicknameFromResponse ?? payload.correo,
          id_factura: facturaFromResponse ?? payload.numero_factura,
        };

        try {
          window.localStorage.setItem("session", JSON.stringify(session));
        } catch {
          // Ignoramos errores de almacenamiento para no bloquear el flujo.
        }
      }

      onClose();
      // Navega al juego con bandera para el tutorial
      // Si necesitas desactivarlo, cambia a enableTutorial=0
      router.push("/juego?enableTutorial=0");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No fue posible completar el ingreso.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files?.length) {
      return;
    }

    const file = files[0];
    console.log("[debug] FILE", file, file.type);
    
    if (!(file.type.startsWith("image/") || file.type.startsWith("application/pdf"))) {
      setSubmitError("Sólo se permite subir una imagen en formato PNG, JPG o PDF.");
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

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0B1E52]/70 px-4 py-8">
      <div className="overflow-y-auto relative w-full max-w-[620px] max-h-[98dvh] rounded-[32px] bg-white px-6 py-9 text-[#0F1F5B] shadow-[0_40px_80px_rgba(15,31,91,0.25)] md:px-20">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ingreso"
          className="cursor-pointer absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#2450F0] text-white transition hover:bg-[#1C3AD4]"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
        <h2 className="mt-10 text-center text-[20px] font-black text-[#2450F0] md:text-[22px]">
          ¡Tu próxima partida comienza aquí!
        </h2>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <InputField
            id="loginEmail"
            label="Correo electrónico"
            placeholder="Correo electrónico"
            icon={<MailIcon className="h-5 w-5" />}
            type="email"
            //minLength={5}
            maxLength={100}
            validate={(value) => 
              {
                if(!value) return "El correo es obligatorio"
                if(value.length<5) return "El campo debe tener al menos 5 caracteres"
                if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return "Ingresa un correo válido."
                return null
              }
            }
            iconWrapperClassName={iconWrapperClass}
            onValidationChange={handleFieldValidationChange}
          />
          <InputField
            id="loginPurchasePlace"
            label="¿Dónde realizaste la compra?"
            placeholder="¿Dónde realizaste la compra?"
            icon={<CartIcon className="h-5 w-5" />}
            options={purchaseOptions}
            validate={(value) => 
              {
                if(!value) return "Selecciona una opción"
                return null
              }
            }
            iconWrapperClassName={iconWrapperClass}
            onValidationChange={handleFieldValidationChange}
          />
          <InputField
            id="loginInvoiceNumber"
            label="Número de factura"
            placeholder="Número de factura"
            icon={<ReceiptIcon className="h-5 w-5" />}
            minLength={0}
            maxLength={30}
            validate={(value) => 
              {
                if(!value) return "Digita un número de factura"
                if(!/^[a-zA-Z0-9_-]+$/.test(value)) return "Ingresa un número de factura válido"
                return null
              }
            }
            iconWrapperClassName={iconWrapperClass}
            onValidationChange={handleFieldValidationChange}
          />
          <div className="px-0 py-3">
            <p className="text-[16px] font-semibold md:text-[17px]">
              Adjuntar foto de la factura
            </p>
            <p className="mt-1 text-[12px] font-light">
              Adjunta la foto de la factura en buena resolución en
              formato PNG, PDF o JPG.
            </p>
            <input
              ref={fileInputRef}
              id="loginAttachments"
              type="file"
              className="sr-only"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFilesSelected}
            />
            <button
              type="button"
              onClick={handleAttachClick}
              className="cursor-pointer mt-4 flex items-center gap-2 text-lg font-medium text-black hover:text-[var(--cpdblue)]"
            >
              <span className={iconWrapperClass}>
                <PlusCircleIcon className="h-5 w-5" />
              </span>
              Adjuntar foto
            </button>
            {attachment && (
              <ul className="mt-4 space-y-2 text-sm text-[var(--cngray)]">
                <li className="flex items-center justify-between rounded-full bg-white px-4 py-2 shadow-[0_2px_6px_rgba(15,31,91,0.08)]">
                  <span className="truncate pr-3">{attachment.name}</span>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="cursor-pointer flex h-6 w-6 min-w-6 items-center justify-center rounded-full bg-[#E1E7FB] text-[var(--cpdblue)] transition hover:bg-[#D2DBFA]"
                    aria-label={`Eliminar archivo ${attachment.name}`}
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </li>
              </ul>
            )}
          </div>
          <label className="cursor-pointer flex items-start gap-3 text-[11px] text-black">
            <input
              type="checkbox"
              name="loginDataAuthorization"
              checked={isDataAuthorized}
              onChange={(event) => setIsDataAuthorized(event.target.checked)}
              className="cursor-pointer mt-1 h-5 w-5 rounded border border-[#2450F0] accent-[#2450F0]"
            />
            <span className="font-[400]">
              Autorizo el{" "}
              <span className="font-bold">
                Tratamiento de Datos Personales
              </span>{" "}
              y envío, llamadas o mensajes.
            </span>
          </label>
          <div className="flex flex-col items-center gap-4">
            {submitError && (
              <p className="text-sm font-semibold text-red-500 text-center">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`flex items-center justify-center rounded-full px-[23px] py-[11px] text-base font-semibold text-white shadow-[0_20px_40px_rgba(15,31,91,0.3)] transition ${isSubmitDisabled ? "bg-[#1C3AD4]/70 cursor-not-allowed" : "bg-[#2450F0] hover:bg-[#1C3AD4] cursor-pointer"}`}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Ingresando..." : "Ingresar al juego"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
