import {
  cancelEventParticipation,
  cancelEventParticipationInputSchema,
} from "@sam-monorepo/application";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import {
  eventOutputSchema,
  isEventWriteToolVisible,
} from "./eventOutputSchema.js";

export const cancelEventParticipationTool = defineTool({
  name: "cancel_event_participation",
  group: ToolGroup.Events,
  title: "Cancel the own sign-up",
  description:
    "Cancels the sign-up of the user for an event of SAM (event_id from list_events) before its end. The position applications and the lineup assignments of the user at the event are removed too. Gives the event like get_event, with is_participating false.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: cancelEventParticipationInputSchema,
  outputSchema: eventOutputSchema,
  isVisible: isEventWriteToolVisible,
  handler: cancelEventParticipation,
});
