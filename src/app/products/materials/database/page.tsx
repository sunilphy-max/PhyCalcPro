"use client";

import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import MaterialDatabase from "@/components/materials/MaterialDatabase";

export default function Page() {
  return (
    <DashboardLayout title="Material Database">
      <CalculatorLayout
        title="Material Database"
        left={<div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Materials Reference</h3>
          <p className="text-sm text-slate-500 mt-1">
            Lookup elastic modulus and basic material properties for common engineering materials.
          </p>
        </div>}
        center={<div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
          <p>Search the material database by name to view basic mechanical properties and modulus values.</p>
        </div>}
        right={<MaterialDatabase />}
      />
    </DashboardLayout>
  );
}
