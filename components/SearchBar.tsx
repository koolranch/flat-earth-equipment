"use client";
import { useState } from "react";
import { FormEvent } from "react";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    if(q) window.location.href = `/search?term=${encodeURIComponent(q)}`;
  };
  
  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl">
      <input
        type="search"
        placeholder="Search SKU, brand, system…"
        value={q}
        onChange={e => setQ(e.target.value)}
        className="w-full rounded-xl border px-4 py-3 shadow"
      />
    </form>
  );
} 