import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';
import type { ApiError } from '@/types';

/**
 * Standardised error response helper.
 * Converts any thrown value into a consistent JSON error shape.
 */
export function handleApiError(err: unknown): NextResponse<ApiError> {
  console.error('[API Error]', err);

  // Zod validation errors
  if (isZodError(err)) {
    const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Standard Error objects
  if (err instanceof Error) {
    // Don't leak internal details in production
    const status = err.message.includes('Unauthorized') ? 401
      : err.message.includes('Forbidden') ? 403
      : err.message.includes('not found') ? 404
      : 500;
    return NextResponse.json({ error: err.message }, { status });
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

function isZodError(err: unknown): err is ZodError {
  return typeof err === 'object' && err !== null && 'errors' in err && Array.isArray((err as ZodError).errors);
}

/** Standard success response helper */
export function successResponse<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/** Standard created response helper */
export function createdResponse<T>(data: T): NextResponse<T> {
  return NextResponse.json(data, { status: 201 });
}
