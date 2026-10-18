import {
  canReadSystemLog,
  listAuditEvents,
  listAuditEventsInputSchema,
} from "@sam-monorepo/application";
import * as z from "zod";
import { dateTimeOutputSchema } from "../../schemas.js";
import {
  defineTool,
  READ_ONLY_TOOL_ANNOTATIONS,
} from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";

const auditEventOutputSchema = z.strictObject({
  id: z.string(),
  type: z
    .string()
    .describe("The event type, for example TASK_CREATED or SHIP_CREATED_V2."),
  created_at: dateTimeOutputSchema,
  created_by: z
    .strictObject({
      user_id: z.string(),
      name: z.string().nullable(),
    })
    .nullable()
    .describe(
      "The user who did the action. Null for an event without a user, for example an automation run.",
    ),
  // `z.json()` would need a cast: the use case gives the JSON column as
  // `unknown`. The column holds only JSON, thus `z.unknown()` is sufficient.
  data: z
    .unknown()
    .describe(
      "The payload with the keys as the app stored them, for example the ids of the changed items. Older events store it as a JSON-encoded string.",
    ),
});

export const listAuditEventsTool = defineTool({
  name: "list_audit_events",
  group: ToolGroup.SystemLog,
  title: "List the audit events",
  description:
    "Gives the system log of SAM, the newest first: each user action and each automation run with its type, its time, the user who did it and the payload. Filter by the types, by the users (created_by_user_ids) and by a time range (from inclusive, to exclusive). Without a type filter, the list does not show the high-volume types (logins, first visits of the day, wiki visits, notifications, read markers), unless include_high_volume is true. The keys of the payload are the data as the app stored them.",
  annotations: READ_ONLY_TOOL_ANNOTATIONS,
  inputSchema: listAuditEventsInputSchema,
  outputSchema: z.strictObject({
    events: z.array(auditEventOutputSchema),
    next_cursor: z.string().nullable(),
  }),
  isVisible: canReadSystemLog,
  handler: async (context, actor, input) => {
    const { events, next_cursor } = await listAuditEvents(
      context,
      actor,
      input,
    );

    return { events, next_cursor };
  },
});
