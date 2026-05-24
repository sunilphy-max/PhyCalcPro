import DashboardLayout from "@/components/DashboardLayout";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Page() {
  return (
    <DashboardLayout title="Combined Loading">
      <div className="min-h-screen bg-slate-50 p-6">
        <ModulePlaceholder
          title="Combined Loading"
          description="Evaluate axial, bending, torsion, and shear effects in a single structural load case."
          details="This module helps you combine multiple loading types into one unified analysis. It is designed to support complex structural designs where multiple simultaneous loads must be checked together."
          highlights={[
            "Axial, bending, torsion and shear envelopes",
            "Support multiple combined loading cases",
            "Quickly validate design against combined stress criteria",
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
