"use client";

type Props = {
  savedProjects: any[];
  loadProjectIntoForm: (p: any) => void;
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
            className="w-full text-left px-3 py-2 mb-2 bg-gray-100 rounded"
          >
            {p.name}
          </button>
        ))
      ) : (
        <p className="text-gray-400 text-sm">No saved projects</p>
      )}
    </div>
  );
}