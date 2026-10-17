import {
  eventParticipationInputSchema,
  signUpForEvent,
} from "@sam-monorepo/application";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import {
  eventOutputSchema,
  isEventWriteToolVisible,
} from "./eventOutputSchema.js";

export const signUpForEventTool = defineTool({
  name: "sign_up_for_event",
  group: ToolGroup.Events,
  title: "Sign up for an event",
  description:
    "Signs the user up for an event of SAM (event_id from list_events, source app) until its end, or changes the comment of the existing sign-up. Without a comment, an existing sign-up keeps its comment. A Discord event takes its sign-ups only on Discord. Gives the event like get_event, with is_participating true.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: eventParticipationInputSchema,
  outputSchema: eventOutputSchema,
  isVisible: isEventWriteToolVisible,
  handler: signUpForEvent,
});
