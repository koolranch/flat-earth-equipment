'use client';
import React from 'react';
export default function DefaultPractice({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="text-base font-medium">Practice</h3>
      <p className="mt-2 text-sm text-muted-foreground">Review OSHA guidance and flashcards. When finished, click below to continue.</p>
      <button onClick={onComplete} className="mt-3 inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Mark Practice Complete</button>
    </div>
  );
}
