"use client";
import { useState } from "react";

export default function Filter<T>({
  label,
  options,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const [sel, setSel] = useState<T | "">("");
  return (
    <label className="block">
      <span className="block font-medium">{label}</span>
      <select
        className="mt-1 block w-full rounded border px-3 py-2"
        value={sel as any}
        onChange={(e) => {
          const v = e.target.value as unknown as T;
          setSel(v);
          onChange(v);
        }}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
} 