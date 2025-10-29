'use client';

import {
  useEffect,
  type FormEvent,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
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
import {
  InputField,
  type InputFieldProps,
} from "../form/InputField";

type RegistrationModalProps = {
  open: boolean;
  onClose: () => void;
};

const iconWrapperClass =
  "aspect-square shrink-0 self-stretch flex items-center justify-center text-[var(--cpdblue)] w-10 h-10 [&>svg]:h-[70%] [&>svg]:w-[70%]";

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
    //minLength: 3,
    maxLength: 100,
    validate: (value) => 
      {
        if(!value) return "Digita tus nombres y apellidos"
        if(value.length<3) return "El campo debe tener al menos 3 caracteres"
        if(!/^[a-zA-Z ]+$/.test(value)) return "Ingresa un nombre válido"
        return null
      }    
  },
  {
    id: "email",
    label: "Correo electrónico",
    placeholder: "Correo electrónico",
    icon: <MailIcon className="h-5 w-5" />,
    type: "email",
    //minLength: 5,
    maxLength: 100,
    validate: (value) => 
      {
        if(!value) return "El correo es obligatorio"
        if(value.length<5) return "El campo debe tener al menos 5 caracteres"
        if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return "Ingresa un correo válido"
        return null
      }
  },
  {
    id: "username",
    label: "Nombre de usuario",
    placeholder: "Nombre de usuario",
    icon: <UserIcon className="h-5 w-5" />,
    //minLength: 3,
    maxLength: 30,
    validate: (value) => 
      {
        if(!value) return "Digita un nombre de usuario"
        if(value.length<3) return "El campo debe tener al menos 3 caracteres"
        if(!/^[a-zA-Z0-9_-]+$/.test(value)) return "Ingresa un nombre de usuario válido"
        return null
      }
  },
  {
    id: "age",
    label: "Edad",
    placeholder: "Edad",
    icon: <UserIcon className="h-5 w-5" />,
    type: "number",
    minValue: 1,
    maxValue: 120,
    validate: (value) => 
      {
        if(!value) return "Digita una edad"
        if(!/^[0-9]+$/.test(value)) return "Ingresa una edad válida"
        return null
      }
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
    validate: (value) => 
      {
        if(!value) return "Selecciona una opción"
        return null
      }
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
    validate: (value) => 
      {
        if(!value) return "Selecciona una opción"
        return null
      }
  },
  {
    id: "invoiceNumber",
    label: "Número de factura",
    placeholder: "Número de factura",
    icon: <ReceiptIcon className="h-5 w-5" />,
    //minLength: 3,
    maxLength: 30,
    validate: (value) => 
      {
        if(!value) return "Digita un número de factura"
        if(value.length<1) return "El campo debe tener al menos 1 caracter"
        if(!/^[a-zA-Z0-9_-]+$/.test(value)) return "Ingresa un número de factura válido"
        return null
      }
  },
];

export const RegistrationModal = ({ open, onClose }: RegistrationModalProps) => {
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

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files?.length) {
      return;
    }

    const file = files[0];
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
      // router.push("/juego");
      router.push("/juego?enableTutorial=1");
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

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="overflow-y-auto relative w-full max-w-[980px] max-h-[98dvh] rounded-[40px] bg-white px-6 py-10 text-[#0F1F5B] shadow-[0_40px_80px_rgba(15,31,91,0.25)] md:px-12">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar registro"
          className="cursor-pointer absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--cpdblue)] text-white transition hover:bg-[#1C3AD4]"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
        <h2 className="mt-6 text-center text-3xl font-extrabold italic text-[var(--cpdblue)] md:text-[34px]">
          Registrarse
        </h2>
        <form
          className="mt-8 grid gap-8 md:grid-cols-2 md:items-start"
          onSubmit={handleSubmit}
        >
          <div className="flex min-w-0 flex-col gap-5">
            {leftFields.map((field) => (
              <InputField
                key={field.id}
                {...field}
                iconWrapperClassName={iconWrapperClass}
                onValidationChange={handleFieldValidationChange}
              />
            ))}
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            {rightFields.map((field) => (
              <InputField
                key={field.id}
                {...field}
                iconWrapperClassName={iconWrapperClass}
                onValidationChange={handleFieldValidationChange}
              />
            ))}
            <div className="px-0 py-3">
              <p className="text-base font-semibold md:text-lg">
                Adjuntar foto de la factura
              </p>
              <p className="mt-1 text-md font-light">
                Adjunta la foto de la factura en buena resolución en
                formato PNG, PDF o JPG.
              </p>
              <input
                ref={fileInputRef}
                id="invoiceAttachments"
                type="file"
                className="sr-only"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFilesSelected}
              />
              <button
                type="button"
                onClick={handleAttachClick}
                className="cursor-pointer mt-4 flex items-center gap-2 text-lg font-medium text-black hover:text-[#1C3AD4]"
              >
                <span className={iconWrapperClass}>
                  <PlusCircleIcon className="h-5 w-5" />
                </span>
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
                name="registrationDataAuthorization"
                checked={isDataAuthorized}
                onChange={(event) => setIsDataAuthorized(event.target.checked)}
                className="mt-1 h-5 w-5 rounded border border-[#2450F0] accent-[#2450F0]"
              />
              <span className="font-[400]">
                Autorizo el{" "}
                <span className="font-bold">
                  Tratamiento de Datos Personales
                </span>{" "}
                  y envío, llamadas o mensajes.
              </span>
            </label>
          </div>
          <div className="md:col-span-2 flex flex-col items-center gap-4">
            {submitError && (
              <p className="text-sm font-semibold text-red-500 text-center">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`mx-auto flex w-full max-w-[240px] items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-[0_20px_40px_rgba(15,31,91,0.3)] transition ${isSubmitDisabled ? "bg-[#1C3AD4]/70 cursor-not-allowed" : "bg-[var(--cpdblue)] hover:bg-[#1C3AD4] cursor-pointer"}`}
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
