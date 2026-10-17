import {
  removeEventManager,
  removeEventManagerInputSchema,
} from "@sam-monorepo/application";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import {
  eventOutputSchema,
  isEventWriteToolVisible,
} from "./eventOutputSchema.js";

export const removeEventManagerTool = defineTool({
  name: "remove_event_manager",
  group: ToolGroup.Events,
  title: "Remove a manager from an event",
  description:
    "Takes the manager role from a citizen (citizen_id from the managers of get_event) at an event that has not ended. Needs can_manage. The creator of the event stays its organizer. Gives the event like get_event.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: removeEventManagerInputSchema,
  outputSchema: eventOutputSchema,
  isVisible: isEventWriteToolVisible,
  handler: removeEventManager,
});
