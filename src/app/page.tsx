"use client";

import SearchBar from "@/components/SearchBar";
import { categories, featuredModules } from "@/data/modules";
import Link from "next/link";
import {
  Calculator,
  Zap,
  RotateCcw,
  Settings,
  Wrench,
  BarChart3,
  Box,
  Cog,
  Layers,
} from "lucide-react";


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
{/* ================= FEATURED MODULES ================= */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">

  <div className="text-center mb-8">
    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
      Quick Access Tools
    </h2>
    <p className="text-slate-400">
      Most frequently used engineering calculations
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

    {featuredModules.map((module) => (
      <Link key={module.id} href={module.route}>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02]">

          <h3 className="text-white font-semibold mb-2">
            {module.title}
          </h3>

          <p className="text-slate-400 text-sm mb-3">
            {module.description}
          </p>

          <div className="text-blue-400 text-sm font-medium">
            Open →
          </div>

        </div>
      </Link>
    ))}

  </div>
</div>
      {/* ================= HERO SECTION ================= */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                PHYCALCPRO
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-6 max-w-3xl mx-auto">
              Engineering Calculation & Design Platform
            </p>

            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              <div className="flex justify-center mb-10">
  <SearchBar />
</div>
              Structural • Machine Design • Fasteners • Materials • Dynamics
            </p>

          </div>
        </div>
      </div>

      {/* ================= CATEGORY SECTION ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Engineering Categories
          </h2>
          <p className="text-slate-400 text-lg">
            Structured engineering tool system
          </p>
        </div>

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
                    <h3 className="text-2xl font-semibold text-white">
                      {category.title}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  {category.modules.map((module) => {
                    const ModuleIcon = module.icon;

                    return (
                      <Link key={module.id} href={module.route}>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02]">

                          <div className="flex items-center gap-3 mb-3">
                            <ModuleIcon className="h-5 w-5 text-slate-300" />
                            <h4 className="text-white font-medium">
                              {module.title}
                            </h4>
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

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">

          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-2 rounded-lg">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-white">
              PHYCALCPRO
            </span>
          </div>

          <p className="text-slate-400 text-sm">
            Professional Engineering Calculation Tools
          </p>

          <p className="text-slate-500 text-xs mt-2">
            © 2026 PHYCALCPRO. All rights reserved.
          </p>

        </div>
      </footer>

    </div>
  );
}