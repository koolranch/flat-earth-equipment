'use client';
import { useEffect, useRef } from 'react';
import { trapFocus } from '@/lib/a11y';

interface FocusManagerProps {
  children: React.ReactNode;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  trapFocus?: boolean;
}

export default function FocusManager({ 
  children, 
  autoFocus = false, 
  restoreFocus = true,
  trapFocus: shouldTrapFocus = false 
}: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store the previously focused element
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    // Auto-focus the container or first focusable element
    if (autoFocus && containerRef.current) {
      const firstFocusable = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        containerRef.current.focus();
      }
    }

    // Set up focus trap
    let cleanup: (() => void) | undefined;
    if (shouldTrapFocus && containerRef.current) {
      cleanup = trapFocus(containerRef.current);
    }

    // Cleanup function
    return () => {
      if (cleanup) cleanup();
      
      // Restore focus to previously active element
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [autoFocus, restoreFocus, shouldTrapFocus]);

  return (
    <div 
      ref={containerRef}
      tabIndex={autoFocus ? -1 : undefined}
      style={{ outline: 'none' }}
    >
      {children}
    </div>
  );
}
