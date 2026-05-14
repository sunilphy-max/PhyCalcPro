"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calculator,
  BarChart3,
  RotateCcw,
  Zap,
  Wrench,
  Settings,
  Home,
  ChevronRight
} from "lucide-react";

export default function DashboardLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products/structural/beams", label: "Beam Analysis", icon: BarChart3 },
    { href: "/products/machine/shafts", label: "Shaft Design", icon: RotateCcw },
    { href: "/products/structural/buckling", label: "Buckling Analysis", icon: Zap },
    { href: "/products/profiles", label: "Area Properties", icon: Calculator },
    { href: "/products/screws", label: "Screw Design", icon: Wrench },
    { href: "/products/materials", label: "Materials", icon: Settings, disabled: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-slate-700">
            <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-2 rounded-lg">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-white">PHYCALCPRO</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
              Engineering Modules
            </div>

            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.disabled ? "#" : item.href}
                  className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                    item.disabled
                      ? "opacity-50 cursor-not-allowed text-slate-500"
                      : isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <IconComponent className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                  {!item.disabled && (
                    <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${
                      isActive ? "rotate-90" : "group-hover:translate-x-1"
                    }`} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-slate-700">
            <div className="text-xs text-slate-500 text-center">
              Professional Engineering Tools
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}