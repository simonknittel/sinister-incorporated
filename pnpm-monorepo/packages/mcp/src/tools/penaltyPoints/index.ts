import type { CatalogTool } from "../../toolDefinition.js";
import { createPenaltyEntryTool } from "./createPenaltyEntry.js";
import { listPenaltyEntriesTool } from "./listPenaltyEntries.js";

export const penaltyPointsTools: readonly CatalogTool[] = [
  createPenaltyEntryTool,
  listPenaltyEntriesTool,
];
