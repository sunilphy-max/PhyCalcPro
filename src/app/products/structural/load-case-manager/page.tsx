import DashboardLayout from "@/components/DashboardLayout";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Page() {
  return (
    <DashboardLayout title="Load Case Manager">
      <div className="min-h-screen bg-slate-50 p-6">
        <ModulePlaceholder
          title="Load Case Manager"
          description="Create, compare, and manage multiple structural load cases with envelope results."
          details="Use this module to build load case combinations, evaluate envelopes for shear and moment, and generate a single design response from many scenarios."
          highlights={[
            "Track load case combinations",
            "Envelope maximum responses",
            "Save and reuse scenario sets",
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
