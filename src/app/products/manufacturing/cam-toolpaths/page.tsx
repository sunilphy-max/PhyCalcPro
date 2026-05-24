import DashboardLayout from "@/components/DashboardLayout";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Page() {
  return (
    <DashboardLayout title="CAM Toolpaths">
      <div className="min-h-screen bg-slate-50 p-6">
        <ModulePlaceholder
          title="CAM Toolpaths"
          description="Explore basic toolpath planning and machining parameter selection."
          details="This module will introduce CAM concepts for cutting strategies, tool motion, and roughing/finishing parameter planning."
          highlights={[
            "Basic toolpath visualization",
            "Machining parameter guidance",
            "CAM workflow overview",
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
