import { HttpErrorResponse } from '@angular/common/http';

export type ApiError = { code: string; message: string };

const DEFAULT_MESSAGE = 'Something went wrong';

function messageFromCode(code: string): string {
  switch (code) {
    case 'EMAIL_ALREADY_EXISTS':
      return 'Email already exists';
    case 'EMAIL_INVALID':
      return 'Email is invalid';
    case 'NAME_REQUIRED':
      return 'Name is required';
    case 'USER_NOT_FOUND':
      return 'User not found';
    default:
      return DEFAULT_MESSAGE;
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return { code: 'UNKNOWN', message: DEFAULT_MESSAGE };
  }

  const status = error.status;
  const code =
    (
      (error.error?.code as string | undefined) ??
      (error.error?.message as string | undefined)
    ) ||
    error.statusText ||
    'UNKNOWN';


  if (status === 401) return { code, message: 'Session expired' };
  if (status === 403) return { code, message: 'No permission' };
  if (status === 404) return { code, message: 'Not found' };
  if (status === 409) return { code, message: messageFromCode(code) };
  if (status === 400) return { code, message: messageFromCode(code) };

  return { code, message: messageFromCode(code) };
}
