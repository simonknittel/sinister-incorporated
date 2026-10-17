import {
  listMyShips,
  listMyShipsInputSchema,
  PageDirection,
} from "@sam-monorepo/application";
import * as z from "zod";
import { dateTimeOutputSchema } from "../../schemas.js";
import {
  defineTool,
  READ_ONLY_TOOL_ANNOTATIONS,
} from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import { shipVariantOutputSchema } from "./shipVariantOutputSchema.js";

export const listMyShipsTool = defineTool({
  name: "list_my_ships",
  group: ToolGroup.Fleet,
  title: "List my ships",
  description:
    "Gives the ships of the citizen of the signed-in user with their variants, sorted by the variant name; the list is empty for a user without a citizen. Filter like list_org_fleet; deleted: true gives only the deleted ships.",
  annotations: READ_ONLY_TOOL_ANNOTATIONS,
  inputSchema: listMyShipsInputSchema.omit({ direction: true }),
  outputSchema: z.strictObject({
    ships: z.array(
      z.strictObject({
        id: z.string(),
        name: z.string().nullable(),
        variant: shipVariantOutputSchema,
        created_at: dateTimeOutputSchema.nullable(),
        deleted_at: dateTimeOutputSchema.nullable(),
      }),
    ),
    total: z.number().int().min(0),
    next_cursor: z.string().nullable(),
  }),
  isVisible: (actor) => actor.authorize("ship", "read"),
  handler: async (context, actor, input) => {
    const { ships, total, next_cursor } = await listMyShips(context, actor, {
      ...input,
      direction: PageDirection.Next,
    });

    return { ships, total, next_cursor };
  },
});
