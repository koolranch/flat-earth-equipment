"use client";

import { Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { createClient } from '@supabase/supabase-js';

type Suggestion = {
  slug: string;
  name: string;
};

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Suggestion[]>([]);

  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setOptions([]);
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('parts')
      .select('slug, name')
      .or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`)
      .limit(5);

    if (error) {
      console.error('Error fetching suggestions:', error);
      return;
    }

    setOptions(data || []);
  };

  return (
    <div className="w-full max-w-xl">
      <Combobox
        as="div"
        value={query}
        onChange={(val) => (window.location.href = `/parts/${val}`)}
      >
        <div className="relative">
          <Combobox.Input
            className="w-full border-0 rounded-lg py-2 pl-10 pr-4 text-black focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Search by SKU or part name"
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