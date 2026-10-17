import {
  EventSourceType,
  EventVisibilityType,
  getEvent,
  getEventInputSchema,
} from "@sam-monorepo/application";
import * as z from "zod";
import { citizenReferenceSchema, dateTimeOutputSchema } from "../../schemas.js";
import {
  defineTool,
  READ_ONLY_TOOL_ANNOTATIONS,
} from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";

export const getEventTool = defineTool({
  name: "get_event",
  group: ToolGroup.Events,
  title: "Get an event",
  description:
    "Gives one event by its event id (from list_events): the details, the creator, the managers, the active participants, whether the lineup is enabled, and what the user can do: can_manage (the event, its participants and its managers), can_manage_positions (the lineup) and is_updatable (false after the end of the event, then nothing can change). visibility_role_ids is empty when the user cannot manage the event. A deleted citizen shows as null.",
  annotations: READ_ONLY_TOOL_ANNOTATIONS,
  inputSchema: getEventInputSchema,
  outputSchema: z.strictObject({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    start_time: dateTimeOutputSchema,
    /** Null when the event has no explicit end */
    end_time: dateTimeOutputSchema.nullable(),
    location: z.string().nullable(),
    visibility: z.enum(EventVisibilityType),
    visibility_role_ids: z.array(z.string()),
    source: z.enum(EventSourceType),
    lineup_enabled: z.boolean(),
    created_by: citizenReferenceSchema.nullable(),
    managers: z.array(citizenReferenceSchema),
    participants: z.array(
      z.strictObject({
        citizen: citizenReferenceSchema.nullable(),
        comment: z.string().nullable(),
        created_at: dateTimeOutputSchema,
      }),
    ),
    can_manage: z.boolean(),
    can_manage_positions: z.boolean(),
    is_updatable: z.boolean(),
    is_participating: z.boolean(),
  }),
  isVisible: (actor) =>
    actor.authorize("event", "read") && actor.citizen !== null,
  handler: (context, actor, input) => getEvent(context, actor, input),
});
