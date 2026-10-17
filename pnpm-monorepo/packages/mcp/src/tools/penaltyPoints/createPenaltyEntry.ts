import {
  createPenaltyEntry,
  createPenaltyEntryInputSchema,
} from "@sam-monorepo/application";
import * as z from "zod";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import { penaltyEntryOutputSchema } from "./penaltyEntryOutputSchema.js";

export const createPenaltyEntryTool = defineTool({
  name: "create_penalty_entry",
  group: ToolGroup.PenaltyPoints,
  title: "Create a penalty entry",
  description:
    "Gives penalty points to a citizen (citizen_id from a Spynet tool) with an optional reason and an optional expiry time. The citizen is notified like in the web app. Gives the new entry in the format of list_penalty_entries. notifications_sent is false when the entry is saved but the notifications failed: do not create the entry again.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: createPenaltyEntryInputSchema,
  outputSchema: z.strictObject({
    entry: penaltyEntryOutputSchema,
    notifications_sent: z.boolean(),
  }),
  isVisible: (actor) => actor.authorize("penaltyEntry", "create"),
  handler: createPenaltyEntry,
});
