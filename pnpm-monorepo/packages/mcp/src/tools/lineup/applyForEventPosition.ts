import {
  applyForEventPosition,
  applyForEventPositionInputSchema,
} from "@sam-monorepo/application";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import {
  isLineupToolVisible,
  lineupPositionSchema,
} from "./lineupOutputSchemas.js";

export const applyForEventPositionTool = defineTool({
  name: "apply_for_event_position",
  group: ToolGroup.Lineup,
  title: "Apply for a position of an event",
  description:
    "Applies the own citizen for a position (position id from get_event_lineup). The user must participate in the event (sign_up_for_event), the lineup must be enabled, and the event must not have ended. A manager of the positions confirms the application with the assignment. A repeated application changes nothing. Gives the position.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: applyForEventPositionInputSchema,
  outputSchema: lineupPositionSchema,
  isVisible: isLineupToolVisible,
  handler: applyForEventPosition,
});
