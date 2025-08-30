'use client';

/**
 * Utility functions for child demo components to communicate with DemoPanel
 * Uses CustomEvent to maintain loose coupling between components
 */

/**
 * Emit a simulation parameter change event
 * Used when users adjust sliders, inputs, or other simulation controls
 */
export function emitSimParamChange(paramName: string, value: any, metadata?: Record<string, any>) {
  try {
    window.dispatchEvent(new CustomEvent('demo:child', {
      detail: {
        type: 'sim_param_change',
        param_name: paramName,
        param_value: value,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    }));
  } catch (error) {
    console.warn('Failed to emit sim param change:', error);
  }
}

/**
 * Emit a demo completion event
 * Used when child components determine the demo is finished
 */
export function emitDemoComplete(metadata?: Record<string, any>) {
  try {
    window.dispatchEvent(new CustomEvent('demo:child', {
      detail: {
        type: 'demo_complete',
        timestamp: new Date().toISOString(),
        ...metadata
      }
    }));
  } catch (error) {
    console.warn('Failed to emit demo complete:', error);
  }
}

/**
 * Emit a demo interaction event
 * Used for tracking user interactions within the demo
 */
export function emitDemoInteraction(action: string, target?: string, metadata?: Record<string, any>) {
  try {
    window.dispatchEvent(new CustomEvent('demo:child', {
      detail: {
        type: 'demo_interaction',
        action,
        target,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    }));
  } catch (error) {
    console.warn('Failed to emit demo interaction:', error);
  }
}

/**
 * Emit a custom demo event
 * Used for demo-specific events that don't fit standard categories
 */
export function emitDemoEvent(type: string, data: Record<string, any>) {
  try {
    window.dispatchEvent(new CustomEvent('demo:child', {
      detail: {
        type,
        timestamp: new Date().toISOString(),
        ...data
      }
    }));
  } catch (error) {
    console.warn('Failed to emit demo event:', error);
  }
}

/**
 * Hook for child components to easily access demo event emitters
 * Provides a clean API for demo interactions
 */
export function useDemoEvents() {
  return {
    emitSimParamChange,
    emitDemoComplete,
    emitDemoInteraction,
    emitDemoEvent
  };
}
