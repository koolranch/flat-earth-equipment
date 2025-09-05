import * as Sentry from '@sentry/nextjs';
export async function withSpan<T>(name: string, op: string, fn: () => Promise<T> | T, attrs?: Record<string, any>): Promise<T> {
  return Sentry.startSpan({ name, op, attributes: attrs || {} }, async () => await fn());
}
