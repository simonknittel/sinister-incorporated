import {
  addEventManagers,
  addEventManagersInputSchema,
} from "@sam-monorepo/application";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import {
  eventOutputSchema,
  isEventWriteToolVisible,
} from "./eventOutputSchema.js";

export const addEventManagersTool = defineTool({
  name: "add_event_managers",
  group: ToolGroup.Events,
  title: "Add managers to an event",
  description:
    "Makes citizens (citizen_ids from search_citizens_and_organizations) managers of an event (event_id from list_events) that has not ended. Needs can_manage. Gives the event like get_event.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: addEventManagersInputSchema,
  outputSchema: eventOutputSchema,
  isVisible: isEventWriteToolVisible,
  handler: addEventManagers,
});
