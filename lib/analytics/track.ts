'use client';

/**
 * Client-side analytics tracking utility
 * Emits events via CustomEvent for flexible handling
 * Can be extended to send data to external analytics services
 */
export function track(evt: string, payload?: Record<string, any>) {
  try {
    // Emit analytics event via CustomEvent for flexible handling
    window.dispatchEvent(new CustomEvent('analytics', { 
      detail: { 
        evt, 
        timestamp: new Date().toISOString(),
        ...payload 
      } 
    }));
    
    // Optional: POST to analytics API for server-side capture
    // Uncomment if you want to store analytics server-side
    /*
    fetch('/api/analytics', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        evt, 
        timestamp: new Date().toISOString(),
        ...payload 
      }) 
    }).catch(() => {
      // Fail silently - analytics shouldn't break user experience
    });
    */
    
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', evt, payload);
    }
    
  } catch (error) {
    // Fail silently - analytics should never break the user experience
    console.warn('Analytics tracking failed:', error);
  }
}

/**
 * Track demo-specific events with consistent payload structure
 */
export function trackDemo(event: 'start' | 'complete' | 'param_change', moduleSlug: string, data?: Record<string, any>) {
  const eventName = `demo_${event}`;
  track(eventName, {
    module: moduleSlug,
    ...data
  });
}

/**
 * Track simulation parameter changes
 */
export function trackSimParam(moduleSlug: string, paramName: string, value: any, metadata?: Record<string, any>) {
  track('sim_param_change', {
    module: moduleSlug,
    param_name: paramName,
    param_value: value,
    ...metadata
  });
}

/**
 * Track user interactions within demos
 */
export function trackDemoInteraction(moduleSlug: string, action: string, target?: string, metadata?: Record<string, any>) {
  track('demo_interaction', {
    module: moduleSlug,
    action,
    target,
    ...metadata
  });
}
