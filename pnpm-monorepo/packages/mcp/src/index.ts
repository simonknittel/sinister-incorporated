/**
 * The MCP server of SAM: the tools, the handler factory and the request
 * handler that verifies the bearer token and builds the principal. The
 * package does not depend on a host. A host (for example a Next.js route)
 * applies its kill switch, builds the application context and calls the
 * request handler.
 */
export { listToolCatalog } from "./catalog.js";
export {
  createMcpRequestHandler,
  type McpRequestHandler,
} from "./createMcpRequestHandler.js";
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
