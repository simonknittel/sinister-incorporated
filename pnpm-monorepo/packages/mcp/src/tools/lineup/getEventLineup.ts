import {
  getEventLineup,
  getEventLineupInputSchema,
} from "@sam-monorepo/application";
import {
  defineTool,
  READ_ONLY_TOOL_ANNOTATIONS,
} from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import { eventLineupSchema } from "./lineupOutputSchemas.js";

export const getEventLineupTool = defineTool({
  name: "get_event_lineup",
  group: ToolGroup.Lineup,
  title: "Get the lineup of an event",
  description:
    "Gives the lineup of an event by its event id (from list_events): the tree of positions (up to four levels) with the required ship variants, the assigned citizen and the citizens who applied (only when can_manage_positions is true, else empty). Only for events whose lineup is enabled, or whose positions the user can manage. A deleted citizen shows as null or is left out.",
  annotations: READ_ONLY_TOOL_ANNOTATIONS,
  inputSchema: getEventLineupInputSchema,
  outputSchema: eventLineupSchema,
  isVisible: (actor) =>
    actor.authorize("event", "read") &&
    actor.authorize("ship", "read") &&
    actor.citizen !== null,
  handler: getEventLineup,
});
