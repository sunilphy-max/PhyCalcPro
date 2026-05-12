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
    <div className="relative w-full max-w-xl">
      {/* Input */}
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search beams, shafts, bolts..."
        className="w-full px-4 py-2 bg-slate-900 text-white border border-slate-700 rounded-lg"
      />

      {/* Dropdown */}
      {results.length > 0 && (
        <div className="absolute w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-50">
          {results.map((r) => (
            <div
              key={r.route}
              onClick={() => handleSelect(r.route)}
              className="px-4 py-2 hover:bg-slate-800 cursor-pointer"
            >
              <div className="text-white text-sm">{r.title}</div>
              <div className="text-slate-400 text-xs">
                {r.category}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}