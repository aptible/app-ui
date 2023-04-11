import * as Sentry from "@sentry/react";

export const initSentry = () =>
  Sentry.init({
    dsn: import.meta.env.SENTRY_DSN,
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
