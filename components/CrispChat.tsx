'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

export default function CrispChat() {
  useEffect(() => {
    // Disable Crisp on the safety landing page only
    if (typeof window !== 'undefined' && window.location?.pathname === '/safety') {
      return;
    }
    // Crisp chat widget
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || "YOUR_CRISP_WEBSITE_ID";
    
    (function() {
      const d = document;
      const s = d.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = true;
      d.getElementsByTagName("head")[0].appendChild(s);
    })();
  }, [])

  return null
} 