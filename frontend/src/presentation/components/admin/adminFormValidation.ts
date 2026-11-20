import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { z } from 'zod';
import { getApiErrorMessage, getApiValidationErrors } from '../../utils/apiErrors';

export const httpUrlField = z.string().trim().refine((value) => {
  if (!value) return true;
  try {
    return ['https:', 'http:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}, 'Ingresa una URL válida que comience con https:// o http://');

export const dateField = z.iso.date('Ingresa una fecha válida');
export const optionalDateField = z.union([dateField, z.literal('')]);

export function utcDate(value: string): string {
  return `${value}T00:00:00.000Z`;
}

export function dateInputValue(value: string | Date | null | undefined): string {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value?.slice(0, 10) ?? '';
}

export function showFormError<T extends FieldValues>(
  error: unknown, fields: Record<string, unknown>, setError: UseFormSetError<T>, fallback: string,
) {
  const validation = getApiValidationErrors(error);
  let hasFieldError = false;
  if (Array.isArray(validation)) {
    for (const issue of validation) {
      const name = issue.path?.replace(/^body\./, '') ?? '';
      if (Object.hasOwn(fields, name)) {
        setError(name as Path<T>, { message: issue.message }, { shouldFocus: !hasFieldError });
        hasFieldError = true;
      }
    }
  }
  if (!hasFieldError) setError('root.server', { message: getApiErrorMessage(error, fallback) });
}
