"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type Option = { label: string; value: string };

export default function ChargerFilters({
  families,
  volts,
  amps,
}: { families: string[]; volts: number[]; amps: number[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const [family, setFamily] = useState(sp.get("family") ?? "");
  const [v, setV] = useState(sp.get("v") ?? "");
  const [a, setA] = useState(sp.get("a") ?? "");

  const familyOpts: Option[] = useMemo(
    () => [{ label: "All", value: "" }, ...families.map((f) => ({ label: f.toUpperCase(), value: f }))],
    [families]
  );
  const voltOpts: Option[] = useMemo(
    () => [{ label: "All", value: "" }, ...volts.map((n) => ({ label: `${n} V`, value: String(n) }))],
    [volts]
  );
  const ampOpts: Option[] = useMemo(
    () => [{ label: "All", value: "" }, ...amps.map((n) => ({ label: `${n} A`, value: String(n) }))],
    [amps]
  );

  function updateQS(next: { family?: string; v?: string; a?: string }) {
    const q = new URLSearchParams(Array.from(sp.entries()));
    if (next.family !== undefined) next.family ? q.set("family", next.family) : q.delete("family");
    if (next.v !== undefined) next.v ? q.set("v", next.v) : q.delete("v");
    if (next.a !== undefined) next.a ? q.set("a", next.a) : q.delete("a");
    const qs = q.toString();
    router.push(`/chargers${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-neutral-500">Family</span>
        <select
          className="rounded-xl border p-2"
          value={family}
          onChange={(e) => {
            setFamily(e.target.value);
            updateQS({ family: e.target.value });
          }}
        >
          {familyOpts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-neutral-500">Voltage</span>
        <select
          className="rounded-xl border p-2"
          value={v}
          onChange={(e) => {
            setV(e.target.value);
            updateQS({ v: e.target.value });
          }}
        >
          {voltOpts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-neutral-500">Current</span>
        <select
          className="rounded-xl border p-2"
          value={a}
          onChange={(e) => {
            setA(e.target.value);
            updateQS({ a: e.target.value });
          }}
        >
          {ampOpts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}


