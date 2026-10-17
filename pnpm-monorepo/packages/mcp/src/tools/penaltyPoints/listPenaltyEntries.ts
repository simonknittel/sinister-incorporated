import {
  listPenaltyEntries,
  listPenaltyEntriesInputSchema,
  PageDirection,
} from "@sam-monorepo/application";
import * as z from "zod";
import { dateTimeOutputSchema } from "../../schemas.js";
import {
  defineTool,
  READ_ONLY_TOOL_ANNOTATIONS,
} from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";

const penaltyEntryCitizenSchema = z.strictObject({
  id: z.string(),
  /** Null for a deleted citizen */
  handle: z.string().nullable(),
  deleted_at: dateTimeOutputSchema.nullable(),
});

export const listPenaltyEntriesTool = defineTool({
  name: "list_penalty_entries",
  group: ToolGroup.PenaltyPoints,
  title: "List penalty entries",
  description:
    "Gives the penalty entries (points, reason, author and expiry) of all citizens or of one citizen (citizen_id from a Spynet tool), the newest first; status active means not expired and not deleted, inactive means expired and not deleted. A user who can read only the own entries must give the citizen id of get_current_user.",
  annotations: READ_ONLY_TOOL_ANNOTATIONS,
  inputSchema: listPenaltyEntriesInputSchema.omit({ direction: true }),
  outputSchema: z.strictObject({
    entries: z.array(
      z.strictObject({
        id: z.string(),
        citizen: penaltyEntryCitizenSchema,
        points: z.number().int(),
        reason: z.string().nullable(),
        created_at: dateTimeOutputSchema,
        created_by: penaltyEntryCitizenSchema.nullable(),
        expires_at: dateTimeOutputSchema.nullable(),
        deleted_at: dateTimeOutputSchema.nullable(),
      }),
    ),
    next_cursor: z.string().nullable(),
  }),
  isVisible: (actor) =>
    actor.authorize("penaltyEntry", "read") ||
    (actor.authorize("ownPenaltyEntry", "read") &&
      actor.authorize("citizen", "read") &&
      actor.citizen !== null),
  handler: async (context, actor, input) => {
    const { entries, next_cursor } = await listPenaltyEntries(context, actor, {
      ...input,
      direction: PageDirection.Next,
    });

    return { entries, next_cursor };
  },
});
