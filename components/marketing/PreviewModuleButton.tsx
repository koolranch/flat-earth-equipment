'use client';

import { trackEvent } from '@/lib/analytics/gtag';

interface PreviewModuleButtonProps {
  text: string;
  href?: string;
}

export default function PreviewModuleButton({ text, href = '/training/module-1-new' }: PreviewModuleButtonProps) {
  const handleClick = () => {
    // Track the preview module click for Google Ads
    trackEvent('preview_module_click', {
      event_category: 'engagement',
      event_label: 'Preview Module 1',
      value: 0
    });

    // Also track as a conversion event if label is configured
    if (typeof window !== 'undefined' && window.gtag) {
      const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
      const previewLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_PREVIEW_LABEL;
      
      if (adsId && previewLabel) {
        window.gtag('event', 'conversion', {
          send_to: `${adsId}/${previewLabel}`,
          event_category: 'engagement',
          event_label: 'Preview Module 1 Click'
        });
      }
    }
  };

  return (
    <a 
      href={href}
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 px-6 py-3 text-slate-700 hover:bg-slate-50 hover:border-[#F76511] hover:text-[#F76511] transition-colors font-medium"
    >
      {text}
    </a>
  );
}

