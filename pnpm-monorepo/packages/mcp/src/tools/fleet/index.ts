import type { CatalogTool } from "../../toolDefinition.js";
import { listMyShipsTool } from "./listMyShips.js";
import { listOrgFleetTool } from "./listOrgFleet.js";
import { searchShipVariantsTool } from "./searchShipVariants.js";

export const fleetTools: readonly CatalogTool[] = [
  listMyShipsTool,
  listOrgFleetTool,
  searchShipVariantsTool,
];
