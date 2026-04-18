import * as Sentry from '@sentry/nextjs';

type LogLevel = 'info' | 'warn' | 'error';

interface LogPayload {
  action: string;
  user_id?: string;
  entity_id?: string;
  success: boolean;
  message?: string;
  metadata?: Record<string, any>;
}

/**
 * Standardized Logger for production observability
 * Outputs cleanly to console in dev, and forwards critical issues to Sentry.
 */
export const actionLog = (level: LogLevel, payload: LogPayload) => {
  const timestamp = new Date().toISOString();
  const logPrefix = `[${timestamp}] [${level.toUpperCase()}] [Action: ${payload.action}]`;
  
  const logMessage = `${logPrefix} - User: ${payload.user_id || 'anonymous'} | Entity: ${payload.entity_id || 'N/A'} | Success: ${payload.success} | Msg: ${payload.message || ''}`;

  if (process.env.NODE_ENV === 'development') {
    if (level === 'error') console.error(logMessage, payload.metadata || '');
    else if (level === 'warn') console.warn(logMessage, payload.metadata || '');
    else console.log(logMessage, payload.metadata || '');
  }

  // Forward errors and warnings to Sentry as actionable events
  if (level === 'error') {
    Sentry.captureException(new Error(payload.message || 'Action Error'), {
      tags: { action: payload.action, entity_id: payload.entity_id },
      user: payload.user_id ? { id: payload.user_id } : undefined,
      extra: payload.metadata
    });
  } else if (level === 'warn') {
    Sentry.captureMessage(payload.message || 'Action Warning', {
      level: 'warning',
      tags: { action: payload.action, entity_id: payload.entity_id },
      extra: payload.metadata
    });
  }
};
