import type { CatalogTool } from "../../toolDefinition.js";
import { createShipTool } from "./createShip.js";
import { deleteShipTool } from "./deleteShip.js";
import { listMyShipsTool } from "./listMyShips.js";
import { listOrgFleetTool } from "./listOrgFleet.js";
import { renameShipTool } from "./renameShip.js";
import { searchShipVariantsTool } from "./searchShipVariants.js";

export const fleetTools: readonly CatalogTool[] = [
  createShipTool,
  deleteShipTool,
  listMyShipsTool,
  listOrgFleetTool,
  renameShipTool,
  searchShipVariantsTool,
];
