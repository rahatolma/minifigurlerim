// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    // Setting this option to true will print useful information in the console while you're setting up Sentry.
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
    },

    replaysOnErrorSampleRate: 1.0,

    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    integrations: [
        Sentry.replayIntegration({
            // Additional Replay configuration goes in here, for example:
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],
});
