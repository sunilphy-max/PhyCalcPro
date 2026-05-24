import DashboardLayout from "@/components/DashboardLayout";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Page() {
  return (
    <DashboardLayout title="Cost Estimation">
      <div className="min-h-screen bg-slate-50 p-6">
        <ModulePlaceholder
          title="Cost Estimation"
          description="Estimate manufacturing cost, process selection, and material expenses."
          details="This module will help you evaluate production cost drivers, choose appropriate manufacturing processes, and compare material cost impacts."
          highlights={[
            "Process cost estimation",
            "Material cost comparisons",
            "Quick production budgeting insights",
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
