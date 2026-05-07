"use client";

type SavedProject = {
  id: string;
  name: string;
  length?: number;
  support?: string;
  created_at?: string;
};

type Props = {
  savedProjects: SavedProject[];
  loadProjectIntoForm: (p: SavedProject) => void;
};

export default function SavedProjects(props: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold mb-3">Saved Projects</h3>

      {props.savedProjects?.length ? (
        props.savedProjects.map((p) => (
  <button
    key={p.id}
    onClick={() => props.loadProjectIntoForm(p)}
    className="w-full text-left px-3 py-2 mb-2 bg-gray-100 rounded hover:bg-gray-200 transition"
  >
    <div className="font-medium">{p.name}</div>

    <div className="text-xs text-gray-500 flex gap-2">
      {p.length && <span>{p.length} m</span>}
      {p.support && <span>• {p.support}</span>}
    </div>
  </button>
))
      ) : (
        <p className="text-gray-400 text-sm">No saved projects</p>
      )}
    </div>
  );
}