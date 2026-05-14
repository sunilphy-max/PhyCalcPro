import React from "react";
import Link from "next/link";

import { categories } from "@/data/modules";

import { Calculator } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-slate-900">

      {/* HEADER */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-10">

          <h1 className="text-4xl font-bold text-white">
            Engineering Products
          </h1>

          <p className="text-slate-400 mt-3 text-lg">
            Browse engineering calculation and design modules
          </p>

        </div>
      </div>

      {/* CATEGORY SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-12">

        <div className="space-y-12">

          {categories.map((category) => {
            const CategoryIcon = category.icon;

            return (
              <div key={category.id} className="space-y-6">

                {/* Category Header */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                    <CategoryIcon className="h-5 w-5 text-white" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold text-white">
                      {category.title}
                    </h2>

                    <p className="text-slate-400 text-sm">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  {category.modules.map((module) => {
                    const ModuleIcon =
                      module.icon ?? Calculator;

                    return (
                      <Link key={module.id} href={module.route}>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02]">

                          <div className="flex items-center gap-3 mb-3">
                            <ModuleIcon className="h-5 w-5 text-slate-300" />

                            <h3 className="text-white font-medium">
                              {module.title}
                            </h3>
                          </div>

                          <p className="text-slate-400 text-sm">
                            {module.description}
                          </p>

                          <div className="mt-4 text-blue-400 text-sm font-medium">
                            Open →
                          </div>

                        </div>
                      </Link>
                    );
                  })}

                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}