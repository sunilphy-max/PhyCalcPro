"use client";

import React from "react";
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

            <div className="text-lg text-slate-400 max-w-2xl mx-auto">
  <p>
    Structural • Machine Design • Fasteners • Materials • Dynamics
  </p>

  <div className="mt-6 flex justify-center">

  </div>
</div>

          </div>
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