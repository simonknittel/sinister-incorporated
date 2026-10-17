import {
  withdrawEventPositionApplication,
  withdrawEventPositionApplicationInputSchema,
} from "@sam-monorepo/application";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import { lineupPositionSchema } from "./lineupOutputSchemas.js";

export const withdrawEventPositionApplicationTool = defineTool({
  name: "withdraw_event_position_application",
  group: ToolGroup.Lineup,
  title: "Withdraw the own application for a position of an event",
  description:
    "Withdraws the own application for a position (position id from get_event_lineup). The event must not have ended. Without an application, the result is a conflict. Gives the position.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: withdrawEventPositionApplicationInputSchema,
  outputSchema: lineupPositionSchema,
  isVisible: (actor) => actor.authorize("event", "read"),
  handler: withdrawEventPositionApplication,
});
