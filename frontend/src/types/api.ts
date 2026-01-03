export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.error === 'string';
}
