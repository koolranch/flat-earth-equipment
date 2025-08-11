"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function Pagination({ total, perPage }: { total: number; perPage: number }) {
  const sp = useSearchParams();
  const router = useRouter();
  const page = Math.max(1, Number(sp.get("page") || 1));
  const pages = Math.max(1, Math.ceil(total / perPage));

  function goto(p: number) {
    const q = new URLSearchParams(sp.toString());
    if (p <= 1) q.delete("page");
    else q.set("page", String(p));
    router.push(`/chargers?${q.toString()}`);
  }

  if (pages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        onClick={() => goto(page - 1)}
        disabled={page <= 1}
        className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm text-neutral-600">
        Page {page} of {pages}
      </span>
      <button
        onClick={() => goto(page + 1)}
        disabled={page >= pages}
        className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}


