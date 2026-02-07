import { validateIndianPhoneNumber } from "./phoneValidation";

export type Validator<T = unknown> = (value: T) => string | null;

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export const validateField = <T>(value: T, validators: Validator<T>[]): string | null => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return null;
};

export const validateForm = <T extends Record<string, any>>(
  values: T,
  rules: { [K in keyof T]?: Validator<T[K]>[] }
): ValidationErrors<T> => {
  const errors: ValidationErrors<T> = {};

  (Object.keys(rules) as Array<keyof T>).forEach((key) => {
    const validators = rules[key];
    if (!validators || validators.length === 0) return;
    const error = validateField(values[key], validators);
    if (error) {
      errors[key] = error;
    }
  });

  return errors;
};

export const required = (message = "This field is required") => (value: unknown) => {
  if (value === null || value === undefined) return message;
  if (typeof value === "string" && value.trim() === "") return message;
  return null;
};

export const minLength = (min: number, message?: string) => (value: string) => {
  if (!value) return null;
  return value.trim().length < min ? message ?? `Must be at least ${min} characters` : null;
};

export const maxLength = (max: number, message?: string) => (value: string) => {
  if (!value) return null;
  return value.trim().length > max ? message ?? `Must be at most ${max} characters` : null;
};

export const email = (message = "Please enter a valid email") => (value: string) => {
  if (!value) return null;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value.trim()) ? null : message;
};

export const indianPhone = (message?: string) => (value: string) => {
  if (!value) return null;
  const result = validateIndianPhoneNumber(value);
  return result.isValid ? null : message ?? result.error ?? "Invalid phone number";
};

type NumberRangeMessages = {
  required?: string;
  invalid?: string;
  min?: string;
  max?: string;
};

type NumberRangeOptions = {
  allowEmpty?: boolean;
  messages?: NumberRangeMessages;
};

export const numberInRange =
  (min: number, max: number, options?: NumberRangeOptions) => (value: unknown) => {
    if (options?.allowEmpty && (value === "" || value === null || value === undefined)) {
      return null;
    }

    if (value === "" || value === null || value === undefined) {
      return options?.messages?.required ?? "This field is required";
    }

    const numericValue = typeof value === "number" ? value : Number(value);

    if (!Number.isFinite(numericValue)) {
      return options?.messages?.invalid ?? "Must be a number";
    }

    if (numericValue < min) {
      return options?.messages?.min ?? `Must be at least ${min}`;
    }

    if (numericValue > max) {
      return options?.messages?.max ?? `Must be at most ${max}`;
    }

    return null;
  };

export const futureDate = (message = "Please select a future date") => (value: string) => {
  if (!value) return null;

  const selectedDate = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selectedDate < today ? message : null;
};
