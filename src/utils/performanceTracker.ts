import * as Sentry from '@sentry/nextjs';

export interface TrackerOptions {
  layer?: string;
  operation?: string;
}

export async function withMonitoring<T>(
  name: string,
  fn: () => Promise<T>,
  options: TrackerOptions = {}
): Promise<T> {
  const t0 = performance.now();
  let success = false;
  
  const layer = options.layer || 'dal';
  const operation = options.operation || 'db_fetch';

  try {
    const result = await fn();
    success = true;
    const duration = performance.now() - t0;
    
    // Determine data size if applicable
    let dataCount = 0;
    if (Array.isArray(result)) dataCount = result.length;
    else if (result && typeof result === 'object' && Array.isArray((result as any).data)) {
        dataCount = (result as any).data.length;
    }

    if (duration > 300) {
      Sentry.withScope((scope) => {
        scope.setTag('area', 'performance');
        scope.setTag('layer', layer);
        scope.setTag('operation', operation);
        scope.setTag('block', name);
        scope.setTag('severity', 'critical');
        Sentry.captureMessage(`[Critical Slow Query] ${name}: ${duration.toFixed(2)}ms (Rows: ${dataCount})`, 'warning');
      });
    } else if (duration > 100) {
      Sentry.withScope((scope) => {
        scope.setTag('area', 'performance');
        scope.setTag('layer', layer);
        scope.setTag('operation', operation);
        scope.setTag('block', name);
        scope.setTag('severity', 'warning');
        Sentry.captureMessage(`[Slow Query] ${name}: ${duration.toFixed(2)}ms (Rows: ${dataCount})`, 'info');
      });
    } else {
       Sentry.addBreadcrumb({
          category: 'dal',
          message: `[Trace] ${name}: ${duration.toFixed(2)}ms`,
          level: 'debug'
       });
    }

    return result;
  } catch (error) {
    const duration = performance.now() - t0;
    Sentry.withScope((scope) => {
      scope.setTag('area', 'database');
      scope.setTag('layer', layer);
      scope.setTag('operation', operation);
      scope.setTag('block', name);
      scope.setTag('severity', 'error');
      Sentry.captureException(error);
    });
    console.error(`[DAL Error] ${name} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}
