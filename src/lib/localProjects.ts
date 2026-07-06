export type { LocalProject, SavedStudy } from "@/lib/persistence/clientStorage";
export {
  loadProjects as loadLocalProjects,
  saveProject as saveLocalProject,
  deleteProject as deleteLocalProject,
  listAllProjects as listAllLocalProjects,
} from "@/lib/persistence/clientStorage";
