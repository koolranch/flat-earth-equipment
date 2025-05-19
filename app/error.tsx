'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Client-side error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">
          We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
        </p>
        <button
          onClick={reset}
          className="bg-canyon-rust text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
} 