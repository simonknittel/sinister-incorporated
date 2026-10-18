import {
  addEventParticipants,
  addEventParticipantsInputSchema,
} from "@sam-monorepo/application";
import * as z from "zod";
import { notificationsSentSchema } from "../../schemas.js";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import {
  eventOutputSchema,
  isEventWriteToolVisible,
} from "./eventOutputSchema.js";

export const addEventParticipantsTool = defineTool({
  name: "add_event_participants",
  group: ToolGroup.Events,
  title: "Add participants to an event",
  description:
    "Signs citizens up for an event of SAM (event_id from list_events) that has not ended, and notifies each added citizen. Needs can_manage. Each citizen (citizen_ids from search_citizens_and_organizations or get_event) must be able to see the event, log in and get event notifications, else nothing is added. Gives the event like get_event and the ids of the added citizens (without the citizens who were already signed up).",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: addEventParticipantsInputSchema,
  outputSchema: z.strictObject({
    event: eventOutputSchema,
    added_citizen_ids: z.array(z.string()),
    notifications_sent: notificationsSentSchema,
  }),
  isVisible: isEventWriteToolVisible,
  handler: addEventParticipants,
});
