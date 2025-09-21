import React from 'react';

export default function ResumeStickyCTA({ 
  href, 
  label = 'Resume training' 
}: { 
  href: string; 
  label?: string 
}) {
  return (
    <div className="mobile-sticky-cta">
      <a 
        href={href} 
        className="btn-primary w-full"
        aria-label={`${label} - Continue your training progress`}
      >
        {label}
      </a>
    </div>
  );
}
