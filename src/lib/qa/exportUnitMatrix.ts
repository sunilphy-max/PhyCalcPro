export type ExportUnitAuditRow = {
  moduleId: string;
  title: string;
  pdfExport: "yes" | "pro-gated" | "partial";
  csvExport: "yes" | "partial";
  unitProfiles: "yes" | "partial" | "no";
  designCodeSelector: "yes" | "no";
  calculationSpec: "yes" | "partial";
  notes?: string;
};

/** Manual audit matrix — update when export or unit behavior changes. */
export const exportUnitAuditMatrix: ExportUnitAuditRow[] = [
  { moduleId: "beams", title: "Beam Analysis", pdfExport: "pro-gated", csvExport: "yes", unitProfiles: "yes", designCodeSelector: "yes", calculationSpec: "yes" },
  { moduleId: "gears", title: "Gear Design", pdfExport: "pro-gated", csvExport: "yes", unitProfiles: "yes", designCodeSelector: "yes", calculationSpec: "yes" },
  { moduleId: "columns", title: "Column Buckling", pdfExport: "pro-gated", csvExport: "yes", unitProfiles: "partial", designCodeSelector: "yes", calculationSpec: "yes" },
  { moduleId: "frames", title: "Frame Analysis", pdfExport: "pro-gated", csvExport: "yes", unitProfiles: "partial", designCodeSelector: "yes", calculationSpec: "yes" },
  { moduleId: "trusses", title: "Truss Analysis", pdfExport: "pro-gated", csvExport: "yes", unitProfiles: "partial", designCodeSelector: "yes", calculationSpec: "yes" },
  { moduleId: "shafts", title: "Shaft Design", pdfExport: "pro-gated", csvExport: "yes", unitProfiles: "partial", designCodeSelector: "yes", calculationSpec: "yes" },
  { moduleId: "bolts", title: "Bolt Calculator", pdfExport: "pro-gated", csvExport: "yes", unitProfiles: "partial", designCodeSelector: "yes", calculationSpec: "yes" },
  { moduleId: "fatigue", title: "Fatigue Assessment", pdfExport: "pro-gated", csvExport: "yes", unitProfiles: "yes", designCodeSelector: "yes", calculationSpec: "yes", notes: "Inline export page" },
  { moduleId: "corrosion", title: "Corrosion Allowance", pdfExport: "pro-gated", csvExport: "yes", unitProfiles: "yes", designCodeSelector: "yes", calculationSpec: "yes", notes: "Inline export page" },
  { moduleId: "combined-loading", title: "Combined Loading", pdfExport: "pro-gated", csvExport: "yes", unitProfiles: "no", designCodeSelector: "yes", calculationSpec: "yes", notes: "Inline export page" },
  { moduleId: "profiles", title: "Area Properties", pdfExport: "pro-gated", csvExport: "yes", unitProfiles: "partial", designCodeSelector: "yes", calculationSpec: "yes" },
  { moduleId: "material-db", title: "Material Database", pdfExport: "partial", csvExport: "partial", unitProfiles: "no", designCodeSelector: "yes", calculationSpec: "partial", notes: "Browse-only module" },
];

export function defaultExportUnitMatrixNote(): string {
  return "Modules not listed explicitly follow the same pattern: ExportableReport + design code selector when moduleId is set.";
}
