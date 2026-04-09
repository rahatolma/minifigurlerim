import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 1,
  debug: false,
  beforeSend(event) {
    if (event.request?.data) {
      try {
        let dataStr = typeof event.request.data === 'string' ? event.request.data : JSON.stringify(event.request.data);
        dataStr = dataStr.replace(/"(serial_number|password|email|phone|recipient_phone)"\s*:\s*"?([^",\s}]+)"?/gi, '"$1":"***"');
        event.request.data = typeof event.request.data === 'string' ? dataStr : JSON.parse(dataStr);
      } catch (e) {
        event.request.data = "*** scrub payload failed ***";
      }
    }
    return event;
  }
});
