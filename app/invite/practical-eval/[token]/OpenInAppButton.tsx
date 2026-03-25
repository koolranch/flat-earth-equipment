'use client';

import { useState } from 'react';

export default function OpenInAppButton({ deepLink }: { deepLink: string }) {
  const [attempted, setAttempted] = useState(false);

  return (
    <div>
      <a
        href={deepLink}
        onClick={() => setAttempted(true)}
        className="block w-full rounded-2xl bg-[#F76511] px-5 py-3 text-center font-semibold text-white hover:bg-[#E55A0C]"
      >
        Open in App
      </a>

      {attempted && (
        <p className="mt-2 text-center text-xs text-slate-500">
          If the app did not open, install or update Forklift Certified and try
          again.
        </p>
      )}
    </div>
  );
}
