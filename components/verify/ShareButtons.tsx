'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
}

export default function ShareButtons({ url }: ShareButtonsProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied'>('idle');

  async function handleCopy() {
    if (!navigator.clipboard) {
      // Fallback for browsers without clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
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
      await navigator.clipboard.writeText(url);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopyStatus('idle');
      alert('Failed to copy link. Please try again.');
    }
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Certificate Verification');
    const body = encodeURIComponent(
      `Please verify my certificate at the following link:\n\n${url}\n\nThis link provides official verification of my training certificate from Flat Earth Safety.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleLinkedInShare = () => {
    const shareUrl = encodeURIComponent(url);
    const text = encodeURIComponent('I have successfully completed my safety training certification. You can verify my certificate here:');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&text=${text}`, '_blank', 'width=600,height=400');
  };

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
    const baseClass = 'rounded-2xl border px-4 py-2 text-sm font-medium transition-all duration-200';
    
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
    <div className="flex flex-col gap-2 w-full">
      {/* Primary Actions */}
      <div className="flex gap-2">
        <button
          className={getCopyButtonClass()}
          onClick={handleCopy}
          disabled={copyStatus === 'copying'}
          type="button"
        >
          {getCopyButtonText()}
        </button>
        
        <button
          className="rounded-2xl border border-slate-300 text-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          onClick={handleEmailShare}
          type="button"
        >
          📧 Email
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex gap-2">
        <button
          className="rounded-2xl border border-blue-300 text-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors flex-1"
          onClick={handleLinkedInShare}
          type="button"
        >
          💼 Share on LinkedIn
        </button>
      </div>

      {/* Additional Share Options */}
      <details className="group">
        <summary className="cursor-pointer text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors list-none">
          <span className="flex items-center justify-center gap-1">
            <span>More sharing options</span>
            <span className="transform transition-transform group-open:rotate-180">▼</span>
          </span>
        </summary>
        
        <div className="mt-2 space-y-1">
          <button
            className="w-full text-left text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Certificate Verification',
                  text: 'Verify my training certificate',
                  url: url
                }).catch(console.error);
              } else {
                handleCopy();
              }
            }}
            type="button"
          >
            📱 Native Share
          </button>
          
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('I have completed my safety training certification. Verify here:')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            🐦 Share on Twitter
          </a>
        </div>
      </details>
    </div>
  );
}
