/**
 * The MCP server of SAM: the tools and the handler factory. The package does
 * not depend on a host. A host (for example a Next.js route) authenticates
 * the request, adapts it and calls the handler.
 */
export { listToolCatalog } from "./catalog.js";
export {
  SERVER_NAME,
  createSamMcpHandler,
  toAuthInfoExtra,
  type CreateSamMcpHandlerOptions,
  type McpPrincipalExtra,
} from "./createSamMcpHandler.js";
export {
  DEFAULT_LIMIT,
  MAXIMUM_LIMIT,
  citizenReferenceSchema,
  cuidSchema,
  cursorSchema,
  dateTimeInputSchema,
  dateTimeOutputSchema,
  eventReferenceSchema,
  limitSchema,
  taskReferenceSchema,
  toIsoString,
} from "./schemas.js";
export { ToolKind, type ToolCatalogEntry } from "./toolDefinition.js";
export { TOOL_GROUP_TITLES, ToolGroup } from "./toolGroup.js";
