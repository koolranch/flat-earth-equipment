"use client";

import { useState, Fragment } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<{ name: string; slug: string }[]>([]);

  async function fetchSuggestions(q: string) {
    if (!q) return setOptions([]);
    const { data } = await supabase
      .from("parts")
      .select("name,slug")
      .ilike("name", `%${q}%`)
      .limit(5);
    setOptions(data ?? []);
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <Combobox
        as="div"
        value={query}
        onChange={(val) => (window.location.href = `/parts/${val}`)}
      >
        <div className="relative">
          <Combobox.Input
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Search parts by name, brand, SKU..."
            onChange={(e) => {
              setQuery(e.target.value);
              fetchSuggestions(e.target.value);
            }}
            displayValue={(val: string) => val}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Combobox.Options className="mt-1 border border-gray-200 rounded-lg bg-white max-h-60 overflow-auto">
            {options.map((opt) => (
              <Combobox.Option
                key={opt.slug}
                value={opt.slug}
                className={({ active }) =>
                  `cursor-pointer select-none p-2 ${
                    active ? "bg-brand-light text-white" : ""
                  }`
                }
              >
                {opt.name}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Transition>
      </Combobox>
    </div>
  );
} 