"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function FilterChips() {
  const sp = useSearchParams();
  const router = useRouter();
  const family = sp.get("family");
  const v = sp.get("v");
  const a = sp.get("a");

  function removeParam(key: string) {
    const q = new URLSearchParams(sp.toString());
    q.delete(key);
    router.push(`/chargers?${q.toString()}`);
  }

  function clearAll() {
    router.push("/chargers");
  }

  const chips: Array<{ key: string; label: string }> = [];
  if (family) chips.push({ key: "family", label: family.toUpperCase() });
  if (v) chips.push({ key: "v", label: `${v} V` });
  if (a) chips.push({ key: "a", label: `${a} A` });

  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          onClick={() => removeParam(c.key)}
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
          aria-label={`Remove ${c.label}`}
        >
          <span>{c.label}</span>
          <span className="text-neutral-500">×</span>
        </button>
      ))}
      <button onClick={clearAll} className="text-sm text-neutral-600 underline underline-offset-4">
        Clear all
      </button>
    </div>
  );
}


