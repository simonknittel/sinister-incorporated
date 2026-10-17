import type { CatalogTool } from "../../toolDefinition.js";
import { listPenaltyEntriesTool } from "./listPenaltyEntries.js";

export const penaltyPointsTools: readonly CatalogTool[] = [
  listPenaltyEntriesTool,
];
