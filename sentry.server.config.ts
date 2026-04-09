import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 1,
  debug: false,
  beforeSend(event) {
    // Scrub sensitive PII and Watch Serials before sending to Sentry
    if (event.request?.data) {
      try {
        let dataStr = typeof event.request.data === 'string' 
          ? event.request.data 
          : JSON.stringify(event.request.data);
        
        // Mask specific keys
        dataStr = dataStr.replace(/"(serial_number|password|email|phone|recipient_phone)"\s*:\s*"?([^",\s}]+)"?/gi, '"$1":"***"');
        
        event.request.data = typeof event.request.data === 'string' ? dataStr : JSON.parse(dataStr);
      } catch (e) {
        // Fail open safely without crashing the event logger
        event.request.data = "*** failed to parse and scrub payload ***";
      }
    }
    
    try {
      require('fs').appendFileSync('validation_sentry.log', JSON.stringify(event) + '\n');
    } catch (fsError) {}

    return event;
  }
});
