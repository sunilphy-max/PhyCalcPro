export type { AssemblyNode, BomRow, DrawingPackage, PackageValidationIssue, BomNodeType } from "./types";
export { parseBomCsv, parseBomXlsx } from "./parseBom";
export { buildAssemblyTree, validateDrawingPackage } from "./validatePackage";
export { unpackDrawingZip, singlePdfPackage } from "./unpackZip";
export {
  buildStackFromManualPicks,
  listPickCandidates,
  listPickCandidatesForParts,
  stackFromSingleExtract,
  type ManualStackPick,
  type StackPickCandidate,
} from "./manualStack";
export {
  findAssemblyNode,
  collectDescendants,
  componentPartNumbersUnder,
  contributorPartNumbersForContext,
  stackLevelForNodeType,
} from "./bomHelpers";
export {
  buildAnnotationLibrary,
  filterAnnotationLibrary,
  scorePartExtract,
  explainFeatureControlFrame,
  explainAnnotation,
  type AnnotationEntry,
  type AnnotationKind,
  type PartExtractQuality,
} from "./annotationLibrary";
export {
  createNamedStack,
  evaluateStackStatus,
  buildAndSolveNamedStack,
  appendRollupContributor,
  stackDashboardRows,
  type NamedStack,
  type NamedStackStatus,
  type StackLevel,
  type StackMethod,
  type StackDashboardRow,
} from "./stackRegistry";
export { proposeStacksFromPackage, type ProposedStack } from "./proposeStacks";
export {
  applyContributorScales,
  proposeAllocationPackages,
  explainDriversFromBreakdown,
  type AllocationPackage,
  type AllocationTarget,
} from "./allocate";
export { buildDrPacketMarkdown, buildDrPacketJson, type DrPacketInput } from "./drPacket";
