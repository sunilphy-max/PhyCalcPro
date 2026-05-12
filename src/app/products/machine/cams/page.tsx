import { getModuleByRoute } from "@/data/modules";
import { notFound } from "next/navigation";

export default function Page() {
  const route = "/products/machine/cams";
  const module = getModuleByRoute(route);

  if (!module) return notFound();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold">{module.title}</h1>
      <p className="text-slate-400 mt-2">{module.description}</p>

      <div className="mt-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
        <p>
          Engineering workspace for <b>{module.title}</b>
        </p>
      </div>
    </div>
  );
}
