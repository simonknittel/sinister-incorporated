import type { CatalogTool } from "../../toolDefinition.js";
import { getEventLineupTool } from "./getEventLineup.js";

export const lineupTools: readonly CatalogTool[] = [getEventLineupTool];
