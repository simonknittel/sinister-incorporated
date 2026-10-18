import { renameShip, renameShipInputSchema } from "@sam-monorepo/application";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import { shipOutputSchema } from "./shipOutputSchema.js";

export const renameShipTool = defineTool({
  name: "rename_ship",
  group: ToolGroup.Fleet,
  title: "Rename a ship",
  description:
    "Changes the name of a ship of the signed-in user (ship_id from list_my_ships). Gives the ship in the format of list_my_ships.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: renameShipInputSchema,
  outputSchema: shipOutputSchema,
  isVisible: (actor) =>
    actor.authorize("ship", "manage") && actor.citizen !== null,
  handler: renameShip,
});
