import {
  createEventPosition,
  createEventPositionInputSchema,
} from "@sam-monorepo/application";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import { lineupPositionSchema } from "./lineupOutputSchemas.js";

export const createEventPositionTool = defineTool({
  name: "create_event_position",
  group: ToolGroup.Lineup,
  title: "Create a position in the lineup of an event",
  description:
    "Adds a position to the lineup of an event (event id from list_events), on the top level or as the last child of a parent position (from get_event_lineup; the lineup has at most four levels). Needs the right to manage the positions of the event (an organizer of the event or the permission for the positions of other events), and the event must not have ended. Gives the new position.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: createEventPositionInputSchema,
  outputSchema: lineupPositionSchema,
  isVisible: (actor) => actor.authorize("event", "read"),
  handler: createEventPosition,
});
