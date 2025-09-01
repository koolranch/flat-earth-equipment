'use client';

import { useState } from 'react';
import QR from '@/components/verify/QR';

interface CertificateActionsProps {
  verificationCode: string;
  pdfUrl?: string | null;
  baseUrl?: string;
}

export default function CertificateActions({ 
  verificationCode, 
  pdfUrl, 
  baseUrl = '' 
}: CertificateActionsProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied'>('idle');
  const [showQR, setShowQR] = useState(false);

  const verifyUrl = `${baseUrl}/verify/${verificationCode}`;

  async function handleCopyLink() {
    if (!navigator.clipboard) {
      // Fallback for browsers without clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = verifyUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
      } catch (err) {
        console.error('Copy fallback failed:', err);
        alert('Unable to copy link. Please copy manually.');
      }
      return;
    }

    try {
      setCopyStatus('copying');
      await navigator.clipboard.writeText(verifyUrl);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopyStatus('idle');
      alert('Failed to copy link. Please try again.');
    }
  }

  const getCopyButtonText = () => {
    switch (copyStatus) {
      case 'copying':
        return '📋 Copying...';
      case 'copied':
        return '✓ Copied!';
      default:
        return '📋 Copy Link';
    }
  };

  const getCopyButtonClass = () => {
    const baseClass = 'rounded-lg border px-2 py-1 text-xs font-medium transition-all duration-200';
    
    switch (copyStatus) {
      case 'copying':
        return `${baseClass} border-blue-300 text-blue-600 bg-blue-50 cursor-wait`;
      case 'copied':
        return `${baseClass} border-emerald-300 text-emerald-600 bg-emerald-50`;
      default:
        return `${baseClass} border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800`;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Primary Actions Row */}
      <div className="flex items-center gap-2">
        <button
          className={getCopyButtonClass()}
          onClick={handleCopyLink}
          disabled={copyStatus === 'copying'}
          type="button"
          title="Copy verification link to clipboard"
        >
          {getCopyButtonText()}
        </button>
        
        {pdfUrl && (
          <a 
            className="rounded-lg border border-[#F76511] text-[#F76511] px-2 py-1 text-xs font-medium hover:bg-[#F76511] hover:text-white transition-colors" 
            href={pdfUrl} 
            target="_blank"
            rel="noopener noreferrer"
            title="Open PDF certificate"
          >
            📄 PDF
          </a>
        )}
        
        <button
          className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
            showQR 
              ? 'border-[#F76511] text-[#F76511] bg-[#F76511]/10' 
              : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          onClick={() => setShowQR(!showQR)}
          type="button"
          title="Show/hide QR code for mobile verification"
        >
          📱 {showQR ? 'Hide QR' : 'Show QR'}
        </button>
      </div>

      {/* Secondary Actions Row */}
      <div className="flex items-center gap-2">
        <a 
          className="rounded-lg border border-blue-300 text-blue-600 px-2 py-1 text-xs font-medium hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors" 
          href={verifyUrl} 
          target="_blank"
          rel="noopener noreferrer"
          title="Open verification page in new tab"
        >
          🔍 View Online
        </a>
        
        <button
          className="rounded-lg border border-slate-300 text-slate-700 px-2 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          onClick={() => {
            const subject = encodeURIComponent('My Safety Training Certificate');
            const body = encodeURIComponent(
              `I have completed my safety training certification. You can verify my certificate at:\n\n${verifyUrl}\n\nThis link provides official verification from Flat Earth Safety.`
            );
            window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
          }}
          type="button"
          title="Share certificate via email"
        >
          📧 Email
        </button>
      </div>

      {/* QR Code Display */}
      {showQR && (
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Scan to verify certificate
            </div>
            <QR value={verifyUrl} size={120} />
            <div className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-40">
              {verifyUrl}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                onClick={handleCopyLink}
                type="button"
              >
                📋 Copy URL
              </button>
              <a
                className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}&text=${encodeURIComponent('I have completed my safety training certification:')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                💼 LinkedIn
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
