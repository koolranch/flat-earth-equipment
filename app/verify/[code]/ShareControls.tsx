"use client";
import React, { useState } from 'react';
import { useT } from '@/lib/i18n';

interface ShareControlsProps {
  url: string;
  qrCode: string | null;
}

export default function ShareControls({ url, qrCode }: ShareControlsProps) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const [shareSupported] = useState(() => 
    typeof navigator !== 'undefined' && 'share' in navigator
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: t('verify.share_title', 'Forklift Certificate Verification'),
          text: t('verify.share_text', 'Verify this forklift operator certificate'),
          url: url,
        });
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-medium text-[#0F172A] mb-4">
        {t('verify.share_verification', 'Share Verification')}
      </h3>
      
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* QR Code */}
        {qrCode && (
          <div className="flex flex-col items-center">
            <div className="p-4 bg-white rounded-lg border-2 border-slate-200 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={qrCode} 
                alt={t('verify.qr_alt', 'QR code for certificate verification')}
                className="w-32 h-32 block"
                width={128}
                height={128}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center max-w-32">
              {t('verify.qr_description', 'Scan to verify certificate')}
            </p>
          </div>
        )}

        {/* Share Controls */}
        <div className="flex-1">
          <div className="mb-3">
            <label 
              htmlFor="verify-url" 
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              {t('verify.verification_url', 'Verification URL')}
            </label>
            <div className="flex gap-2">
              <input
                id="verify-url"
                type="text"
                value={url}
                readOnly
                className="
                  flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg
                  bg-slate-50 text-slate-700 font-mono
                  focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-[#F76511]
                "
                onClick={(e) => e.currentTarget.select()}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:ring-opacity-50
                ${copied 
                  ? 'bg-green-50 border-green-300 text-green-700' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }
              `}
              disabled={copied}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('verify.copied', 'Copied!')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {t('verify.copy_link', 'Copy Link')}
                </>
              )}
            </button>

            {shareSupported && (
              <button
                onClick={handleShare}
                className="
                  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                  bg-[#F76511] text-white hover:bg-orange-600 transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:ring-opacity-50
                "
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                {t('verify.share', 'Share')}
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-3">
            {t('verify.share_instructions', 'Share this link to allow others to verify the authenticity of this certificate.')}
          </p>
        </div>
      </div>
    </div>
  );
}
