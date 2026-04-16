import * as Sentry from '@sentry/nextjs';

export function sanitizeFilter(value: string | undefined | null): string | null {
  if (!value || value.toLowerCase() === 'all' || value === 'undefined' || value === 'null') {
    return null;
  }
  return value;
}

export function captureDalError(methodName: string, error: any, contextData: any = {}) {
  console.error(`[DAL ERROR - ${methodName}]`, error);
  Sentry.captureException(error, {
    tags: { layer: 'dal', db_method: methodName },
    extra: {
      ...contextData,
      raw_error: error
    }
  });
}
