import * as Sentry from "@sentry/react";

export const initSentry = () =>
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    // WARNING - disabled browser tracing, but this can be enabled for perf tracking
    integrations: [],
  });

export const sentryErrorReporter = (_: any) => (next: any) => (action: any) => {
  try {
    next(action);
  } catch (err) {
    Sentry.captureException(err);
  }
};
