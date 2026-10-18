import type { CatalogTool } from "../../toolDefinition.js";
import { listAuditEventsTool } from "./listAuditEvents.js";

export const systemLogTools: readonly CatalogTool[] = [listAuditEventsTool];
