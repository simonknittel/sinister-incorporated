import type { CatalogTool } from "../../toolDefinition.js";
import { getEventTool } from "./getEvent.js";
import { listEventsTool } from "./listEvents.js";

export const eventsTools: readonly CatalogTool[] = [
  getEventTool,
  listEventsTool,
];
