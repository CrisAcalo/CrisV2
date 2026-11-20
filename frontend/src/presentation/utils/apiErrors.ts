import { isAxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
  errors?: Array<{ path: string; message: string }>;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
}

export function getApiStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

export function getApiValidationErrors(error: unknown): ApiErrorBody['errors'] {
  return isAxiosError<ApiErrorBody>(error) ? error.response?.data?.errors : undefined;
}
