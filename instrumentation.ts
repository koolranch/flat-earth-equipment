export async function register(){
  if (process.env.SENTRY_DSN){
    await import('./sentry.server.config');
  }
}
