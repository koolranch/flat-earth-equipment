// Client-side error monitoring
window.addEventListener('error', (e) => {
  fetch('/api/monitor/client-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'window.onerror',
      message: String(e.error || e.message),
      meta: {
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    })
  }).catch(() => {
    // Silently fail - don't let monitoring break the app
  });
});

window.addEventListener('unhandledrejection', (e) => {
  fetch('/api/monitor/client-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'unhandledrejection',
      message: String(e.reason),
      meta: {
        reason: e.reason,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    })
  }).catch(() => {
    // Silently fail - don't let monitoring break the app
  });
});
