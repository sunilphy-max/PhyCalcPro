"use client";

import Link from "next/link";
import { useState } from "react";
import { categories } from "@/data/modules";

export default function Sidebar() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <div className="h-screen w-72 bg-slate-950 border-r border-slate-800 text-white overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">PhyCalcPro</h1>
        <p className="text-xs text-slate-400">
          Engineering Modules
        </p>
      </div>

      {/* Categories */}
      <div className="p-2 space-y-2">
        {categories.map((cat) => {
          const isOpen = openCategory === cat.id;

          return (
            <div key={cat.id} className="rounded-lg overflow-hidden">
              {/* Category Button */}
              <button
                onClick={() =>
                  setOpenCategory(isOpen ? null : cat.id)
                }
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition"
              >
                <div className="font-semibold text-sm">
                  {cat.title}
                </div>
                <div className="text-xs text-slate-400">
                  {cat.description}
                </div>
              </button>

              {/* Modules */}
              {isOpen && (
                <div className="ml-3 mt-1 space-y-1 border-l border-slate-700 pl-3">
                  {cat.modules.map((mod) => (
                    <Link
                      key={mod.id}
                      href={mod.route}
                      className="block text-sm px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
                    >
                      {mod.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}