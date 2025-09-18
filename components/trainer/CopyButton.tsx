'use client';

export default function CopyButton({ text, className = "", ...props }: { 
  text: string; 
  className?: string;
  [key: string]: any;
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  return (
    <button 
      type="button" 
      onClick={handleCopy}
      className={`px-2 py-1 border rounded hover:bg-gray-50 ${className}`}
      {...props}
    >
      Copy
    </button>
  );
}
