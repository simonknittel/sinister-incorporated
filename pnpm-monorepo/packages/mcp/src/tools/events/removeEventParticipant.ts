import {
  removeEventParticipant,
  removeEventParticipantInputSchema,
} from "@sam-monorepo/application";
import * as z from "zod";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import {
  eventOutputSchema,
  isEventWriteToolVisible,
  notificationsSentSchema,
} from "./eventOutputSchema.js";

export const removeEventParticipantTool = defineTool({
  name: "remove_event_participant",
  group: ToolGroup.Events,
  title: "Remove a participant from an event",
  description:
    "Cancels the sign-up of a citizen (citizen_id from the participants of get_event) for an event of SAM that has not ended, and notifies the citizen with the optional reason. Needs can_manage. The position applications and the lineup assignments of the citizen at the event are removed too. Gives the event like get_event.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: removeEventParticipantInputSchema,
  outputSchema: z.strictObject({
    event: eventOutputSchema,
    notifications_sent: notificationsSentSchema,
  }),
  isVisible: isEventWriteToolVisible,
  handler: removeEventParticipant,
});
