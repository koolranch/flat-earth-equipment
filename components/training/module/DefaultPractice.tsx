'use client';
import React from 'react';

export default function DefaultPractice({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="text-base font-medium">Practice</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Review the OSHA guidance and flashcards, then click the button below when you've practiced this material.
      </p>
      <button
        onClick={onComplete}
        className="mt-4 inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-muted"
        aria-label="Mark practice complete"
      >
        Mark Practice Complete
      </button>
    </div>
  );
}
