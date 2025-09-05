import * as Sentry from '@sentry/nextjs';
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || '';
if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    replaysSessionSampleRate: Number(process.env.SENTRY_REPLAYS_SAMPLE_RATE || '0.0'),
    integrations: [
      ...(process.env.SENTRY_ENABLE_LOGS === '1'
        ? [Sentry.consoleIntegration()]
        : []),
    ],
  });
}
