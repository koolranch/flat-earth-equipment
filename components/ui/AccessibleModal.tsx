'use client';
import { useEffect, useRef } from 'react';

export default function AccessibleModal({ 
  open, 
  onClose, 
  titleId, 
  children 
}: { 
  open: boolean; 
  onClose: () => void; 
  titleId: string; 
  children: React.ReactNode 
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!open) return;
    
    const node = ref.current!;
    const focusables = node.querySelectorAll<HTMLElement>(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      
      if (e.key === 'Tab' && focusables.length) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    
    // Add event listener and focus first element
    document.addEventListener('keydown', handleKeyDown);
    first?.focus();
    
    // Cleanup
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div 
        ref={ref} 
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-2xl p-4 max-w-lg w-[92vw] max-h-[90vh] overflow-y-auto shadow-xl"
      >
        {children}
      </div>
    </div>
  );
}
