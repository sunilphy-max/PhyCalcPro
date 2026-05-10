"use client";

import Link from "next/link";
import { Calculator, Zap, RotateCcw, Settings, Wrench, BarChart3 } from "lucide-react";

export default function HomePage() {
  const modules = [
    {
      id: "beams",
      title: "Beam Analysis",
      description: "Deflection, stress, bending moment, and shear force calculations",
      icon: BarChart3,
      href: "/products/beams",
      color: "from-blue-500 to-blue-600",
      available: true,
    },
    {
      id: "shafts",
      title: "Shaft Design",
      description: "Combined stress analysis, fatigue, and critical speed calculations",
      icon: RotateCcw,
      href: "/products/shafts",
      color: "from-green-500 to-green-600",
      available: true,
    },
    {
      id: "buckling",
      title: "Buckling Analysis",
      description: "Euler buckling, end conditions, and stability analysis",
      icon: Zap,
      href: "/products/buckling",
      color: "from-purple-500 to-purple-600",
      available: true,
    },
    {
      id: "profiles",
      title: "Area Properties",
      description: "Cross-sectional properties, centroids, and moment of inertia",
      icon: Calculator,
      href: "/products/profiles",
      color: "from-orange-500 to-orange-600",
      available: true,
    },
    {
      id: "screws",
      title: "Screw Design",
      description: "Power screws and ball screws analysis with efficiency calculations",
      icon: Wrench,
      href: "/products/screws",
      color: "from-red-500 to-red-600",
      available: true,
    },
    {
      id: "materials",
      title: "Materials Database",
      description: "Material properties and selection for engineering applications",
      icon: Settings,
      href: "/products/materials",
      color: "from-gray-500 to-gray-600",
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                MITCALC
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Professional Engineering Calculation Suite for Mechanical Engineers
            </p>
            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
              Comprehensive analysis tools for structural mechanics, machine design, and engineering calculations
              with industry-standard accuracy and professional reporting.
            </p>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Engineering Modules
          </h2>
          <p className="text-slate-400 text-lg">
            Choose from our comprehensive suite of engineering calculation tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <div
                key={module.id}
                className={`relative group ${
                  module.available
                    ? "cursor-pointer transform transition-all duration-300 hover:scale-105"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                {module.available ? (
                  <Link href={module.href}>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 h-full hover:bg-slate-800/70 transition-all duration-300">
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${module.color} mb-4`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {module.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {module.description}
                      </p>
                      <div className="mt-4 flex items-center text-blue-400 text-sm font-medium">
                        Start Calculation
                        <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 h-full">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${module.color} mb-4 opacity-50`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-500 mb-2">
                      {module.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {module.description}
                    </p>
                    <div className="mt-4 flex items-center text-slate-500 text-sm font-medium">
                      Coming Soon
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-2 rounded-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">MITCALC</span>
            </div>
            <p className="text-slate-400 text-sm">
              Professional Engineering Calculation Tools • Built for Mechanical Engineers
            </p>
            <p className="text-slate-500 text-xs mt-2">
              © 2026 MITCALC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}