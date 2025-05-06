"use client";

import { useState, useEffect, Fragment } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Combobox, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";

type Suggestion = {
  slug: string;
  name: string;
};

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!query) return setResults([]);
    const fetch = async () => {
      const { data } = await supabase
        .from("parts")
        .select("slug,name")
        .ilike("name", `%${query}%`)
        .limit(10);
      setResults(data || []);
    };
    fetch();
  }, [query]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Combobox
        value={query}
        onChange={(val: string) => {
          setQuery(val);
          const match = results.find((r) => r.name === val);
          if (match?.slug) router.push(`/parts/${match.slug}`);
        }}
        nullable
      >
        <Combobox.Input
          className="w-full rounded border px-3 py-2"
          displayValue={(val: string) => val}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search SKU, brand, system..."
        />
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white shadow-lg">
            {results.length === 0 && query ? (
              <Combobox.Option
                value=""
                disabled
                className="px-4 py-2 text-gray-500"
              >
                No results found
              </Combobox.Option>
            ) : (
              results.map((item) => (
                <Combobox.Option
                  key={item.slug}
                  value={item.name}
                  className={({ active }) =>
                    `cursor-pointer px-4 py-2 ${
                      active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                    }`
                  }
                >
                  {item.name}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </Combobox>
    </div>
  );
} 