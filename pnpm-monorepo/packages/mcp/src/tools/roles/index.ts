import type { CatalogTool } from "../../toolDefinition.js";
import { getRoleTool } from "./getRole.js";
import { listRolesTool } from "./listRoles.js";

export const rolesTools: readonly CatalogTool[] = [getRoleTool, listRolesTool];
