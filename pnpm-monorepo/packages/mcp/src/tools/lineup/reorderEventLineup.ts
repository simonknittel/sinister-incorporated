import {
  reorderEventLineup,
  reorderEventLineupInputSchema,
} from "@sam-monorepo/application";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import {
  eventLineupSchema,
  isLineupToolVisible,
} from "./lineupOutputSchemas.js";

export const reorderEventLineupTool = defineTool({
  name: "reorder_event_lineup",
  group: ToolGroup.Lineup,
  title: "Reorder the lineup of an event",
  description:
    "Sets the order and the parents of the positions of the lineup of an event (event id from list_events). Send the full tree of get_event_lineup with only the id and the children of each position, in the new order; a position moves to the parent under which it is in the tree, and a position that the tree does not name keeps its parent. Each position may be in the tree only one time, only positions of this lineup, and no position may end up below the fourth level. Needs the right to manage the positions of the event, and the event must not have ended. Gives the lineup after the change.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: reorderEventLineupInputSchema,
  outputSchema: eventLineupSchema,
  isVisible: isLineupToolVisible,
  handler: reorderEventLineup,
});
