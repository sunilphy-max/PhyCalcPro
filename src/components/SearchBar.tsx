"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { searchModules } from "@/lib/search";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  function handleSearch(value: string) {
    setQuery(value);
    setResults(searchModules(value));
  }

  function handleSelect(route: string) {
    setQuery("");
    setResults([]);
    router.push(route);
  }

  return (
    <div className="relative w-full">
      {/* Input */}
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search beams, shafts, bolts..."
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-700"
      />

      {/* Dropdown */}
      {results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {results.map((r) => (
            <div
              key={r.route}
              onClick={() => handleSelect(r.route)}
              className="cursor-pointer px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-900 dark:text-white">{r.title}</div>
                {r.comingSoon && (
                  <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                    Coming soon
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {r.category}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}