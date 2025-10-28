'use client';

import {
  useState,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
} from "react";
import { ArrowDownIcon } from "../../assets/icons";

export type InputFieldOption = {
  label: string;
  value: string;
};

export type InputFieldProps = {
  id: string;
  label: string;
  icon: ReactNode;
  placeholder?: string;
  type?: string;
  options?: InputFieldOption[];
  validate?: (value: string) => string | null;
  onValidationChange?: (fieldId: string, error: string | null) => void;
  containerClassName?: string;
  inputClassName?: string;
  iconWrapperClassName?: string;
  invalidContainerClassName?: string;
  invalidIconWrapperClassName?: string;
  errorClassName?: string;
  labelClassName?: string;
};

const defaultContainerClass =
  "flex items-center gap-3 rounded-full bg-[#F5F7FD] px-5 py-3 shadow-[inset_0_1px_2px_rgba(12,37,106,0.12)]";
const defaultInputClass =
  "w-full bg-transparent text-sm font-medium text-[#1A1A1A] placeholder:text-[#1A1A1A] focus:outline-none";
const defaultIconWrapperClass =
  "aspect-square shrink-0 self-stretch flex items-center justify-center text-[var(--cpdblue)] w-10 h-10 [&>svg]:h-[70%] [&>svg]:w-[70%]";
const defaultInvalidContainerClass = "outline outline-2 outline-red-500";
const defaultInvalidIconWrapperClass = "text-red-500 [&>svg]:text-red-500";
const defaultErrorClass = "pl-3 text-xs font-semibold text-red-500";
const defaultLabelClass =
  "flex flex-col gap-2 text-sm font-semibold text-[#0F1F5B]";

export const InputField = ({
  id,
  label,
  icon,
  placeholder,
  type = "text",
  options,
  validate,
  onValidationChange,
  containerClassName,
  inputClassName,
  iconWrapperClassName,
  invalidContainerClassName,
  invalidIconWrapperClassName,
  errorClassName,
  labelClassName,
}: InputFieldProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);
  const errorId = `${id}-error`;
  const hasError = Boolean(validate && isTouched && errorMessage !== null);

  const resolvedContainerClass =
    containerClassName ?? defaultContainerClass;
  const resolvedInputClass = inputClassName ?? defaultInputClass;
  const resolvedIconWrapperClass =
    iconWrapperClassName ?? defaultIconWrapperClass;
  const resolvedInvalidContainerClass =
    invalidContainerClassName ?? defaultInvalidContainerClass;
  const resolvedInvalidIconWrapperClass =
    invalidIconWrapperClassName ?? defaultInvalidIconWrapperClass;
  const resolvedErrorClass = errorClassName ?? defaultErrorClass;
  const resolvedLabelClass = labelClassName ?? defaultLabelClass;

  const runValidation = (
    value: string,
    markTouched = false,
  ) => {
    if (!validate) {
      return;
    }

    if (markTouched && !isTouched) {
      setIsTouched(true);
    }

    const nextMessage = validate(value);
    if (nextMessage !== errorMessage) {
      setErrorMessage(nextMessage);
      onValidationChange?.(id, nextMessage);
    }
  };

  const handleBlur = (
    event: FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    runValidation(event.target.value, true);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (!validate || !isTouched) {
      return;
    }

    runValidation(event.target.value);
  };

  const validationProps = validate
    ? {
        onBlur: handleBlur,
        onChange: handleChange,
        "aria-invalid": hasError ? true : undefined,
        "aria-describedby": hasError && errorMessage ? errorId : undefined,
      }
    : {};

  const containerClasses = `${resolvedContainerClass}${
    hasError ? ` ${resolvedInvalidContainerClass}` : ""
  }`;
  const iconClasses = `${resolvedIconWrapperClass}${
    hasError ? ` ${resolvedInvalidIconWrapperClass}` : ""
  }`;

  return (
    <label className={resolvedLabelClass} htmlFor={id}>
      <span className="sr-only">{label}</span>
      <div className={containerClasses}>
        <span className={iconClasses}>{icon}</span>
        {options ? (
          <div className="relative w-full">
            <select
              id={id}
              name={id}
              className={`${resolvedInputClass} appearance-none pr-8`}
              defaultValue=""
              {...validationProps}
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
            className={resolvedInputClass}
            placeholder={placeholder ?? label}
            {...validationProps}
          />
        )}
      </div>
      {hasError && errorMessage && (
        <span id={errorId} className={resolvedErrorClass}>
          {errorMessage}
        </span>
      )}
    </label>
  );
};
