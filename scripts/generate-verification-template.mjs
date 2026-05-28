import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const MODULES = [
  ["beams", "Beam Analysis", "Structural"],
  ["frames", "Frame Analysis", "Structural"],
  ["trusses", "Truss Analysis", "Structural"],
  ["columns", "Column Buckling", "Structural"],
  ["plates", "Plate Bending", "Structural"],
  ["combined-loading", "Combined Loading", "Structural"],
  ["load-case-manager", "Load Case Manager", "Structural"],
  ["shafts", "Shaft Design", "Machine"],
  ["gears", "Gear Design", "Machine"],
  ["bearings", "Bearing Selection", "Machine"],
  ["cams", "Cam Design", "Machine"],
  ["flywheels", "Flywheel Design", "Machine"],
  ["bolts", "Bolt Calculator", "Fasteners"],
  ["welds", "Weld Group Analysis", "Fasteners"],
  ["rivets", "Rivet Analysis", "Fasteners"],
  ["safety-factor", "Safety Factor", "Fasteners"],
  ["material-db", "Material Database", "Materials"],
  ["sections", "Section Properties", "Materials"],
  ["composites", "Composite Materials", "Materials"],
  ["temperature-properties", "Temperature Properties", "Materials"],
  ["fatigue", "Fatigue Assessment", "Materials"],
  ["corrosion", "Corrosion Allowance", "Materials"],
  ["pipes", "Pipe Stress Analysis", "Pressure"],
  ["vessels", "Pressure Vessels", "Pressure"],
  ["hydraulics", "Hydraulic Cylinders", "Pressure"],
  ["heat-exchangers", "Heat Exchangers", "Pressure"],
  ["vibrations", "Vibration Analysis", "Dynamics"],
  ["rotation", "Rotational Systems", "Dynamics"],
  ["impact", "Impact & Shock", "Dynamics"],
  ["suspension", "Suspension & Sway", "Dynamics"],
  ["tolerance", "Tolerance Stackup", "Manufacturing"],
  ["fits", "Fits & Clearances", "Manufacturing"],
  ["cost-estimator", "Cost Estimation", "Manufacturing"],
  ["cam-toolpaths", "CAM Toolpaths", "Manufacturing"],
  ["profiles", "Area Properties", "Profiles"],
];

const GEAR_CHECKS = [
  ["bending_strength", "Bending strength SF", "safety_factor"],
  ["contact_strength", "Contact (pitting) strength SF", "safety_factor"],
  ["scuffing", "Scuffing SF", "safety_factor"],
  ["bending_fatigue", "Bending fatigue SF", "safety_factor"],
  ["contact_fatigue", "Contact fatigue SF", "safety_factor"],
  ["micropitting", "Micropitting SF", "safety_factor"],
];

const instructions = [
  ["PhyCalcPro — Verification workbook (Phase 0)"],
  [""],
  ["Fill out the sheets below and return this file (or export JSON benchmarks)."],
  ["Yellow columns are required for each benchmark case you verify."],
  [""],
  ["Sheets:"],
  ["1_Instructions — this page"],
  ["2_Modules — confirm US / EU / ISO document references per module"],
  ["3_Checks — confirm which engineering checks apply; set Implemented to YES when verified"],
  ["4_Benchmarks — one row per test case (your worked examples)"],
  ["5_PassFail — minimum limits per check (SF, utilization, etc.)"],
  [""],
  ["Design codes: INDICATIVE | US | EU | ISO"],
  ["Metric kinds: safety_factor | utilization | stress | deflection | life | other"],
];

const moduleHeaders = [
  "moduleId",
  "moduleTitle",
  "category",
  "US_document",
  "US_clause",
  "US_edition",
  "EU_document",
  "EU_clause",
  "EU_edition",
  "ISO_document",
  "ISO_clause",
  "ISO_edition",
  "notes",
  "validationStatus_target",
];

const moduleRows = MODULES.map(([id, title, cat]) => [
  id,
  title,
  cat,
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "indicative",
]);

const checkHeaders = [
  "moduleId",
  "checkId",
  "checkLabel",
  "metricKind",
  "applies_US",
  "applies_EU",
  "applies_ISO",
  "implemented_INDICATIVE",
  "implemented_US",
  "implemented_EU",
  "implemented_ISO",
  "US_min_limit",
  "EU_min_limit",
  "ISO_min_limit",
  "limit_type",
  "notes",
];

const checkRows = [];
for (const [moduleId] of MODULES) {
  const checks =
    moduleId === "gears"
      ? GEAR_CHECKS
      : [["primary", "Primary design check", "utilization"]];
  for (const [id, label, kind] of checks) {
    checkRows.push([
      moduleId,
      id,
      label,
      kind,
      moduleId === "gears" ? "YES" : "",
      moduleId === "gears" ? "YES" : "",
      moduleId === "gears" ? "YES" : "",
      "YES",
      "",
      "",
      "",
      "",
      "",
      "",
      moduleId === "gears" && kind === "safety_factor" ? "min_safety_factor" : "max_utilization",
      "",
    ]);
  }
}

const benchmarkHeaders = [
  "case_id",
  "moduleId",
  "designCode",
  "description",
  "source_reference",
  "input_json",
  "expected_maxDeflection",
  "expected_maxStress",
  "expected_safetyFactor",
  "expected_contactSafetyFactor",
  "expected_utilization",
  "expected_other_key",
  "expected_other_value",
  "tolerancePercent",
  "your_result_matches",
  "feedback_notes",
];

const benchmarkExample = [
  "gears-US-example-1",
  "gears",
  "US",
  "Example: spur gear power rating",
  "AGMA 2101 sample / your worksheet",
  '{"power_kW":15,"rpm":1200,"module_mm":5,"pinionTeeth":20,"gearRatio":4}',
  "",
  "",
  "1.85",
  "1.42",
  "",
  "",
  "",
  "5",
  "",
  "",
];

const passFailHeaders = [
  "moduleId",
  "checkId",
  "designCode",
  "metricKind",
  "pass_rule",
  "limit_value",
  "unit",
  "standard_clause",
  "notes",
];

const passFailExample = [
  "gears",
  "bending_strength",
  "US",
  "safety_factor",
  "value >=",
  "1.0",
  "-",
  "AGMA 2101-D04",
  "Minimum bending safety factor",
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(instructions), "1_Instructions");
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([moduleHeaders, ...moduleRows]),
  "2_Modules"
);
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([checkHeaders, ...checkRows]),
  "3_Checks"
);
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([benchmarkHeaders, benchmarkExample]),
  "4_Benchmarks"
);
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([passFailHeaders, passFailExample]),
  "5_PassFail"
);

const outDir = join(root, "docs");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "PhyCalcPro_Verification_Template.xlsx");
XLSX.writeFile(wb, outPath);
console.log("Wrote", outPath);
