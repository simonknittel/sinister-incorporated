import { deleteShip, deleteShipInputSchema } from "@sam-monorepo/application";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import { shipOutputSchema } from "./shipOutputSchema.js";

export const deleteShipTool = defineTool({
  name: "delete_ship",
  group: ToolGroup.Fleet,
  title: "Delete a ship",
  description:
    "Deletes a ship of the signed-in user (ship_id from list_my_ships). The ship stays in list_my_ships with deleted: true. Gives the deleted ship with deleted_at.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: deleteShipInputSchema,
  outputSchema: shipOutputSchema,
  isVisible: (actor) =>
    actor.authorize("ship", "manage") && actor.citizen !== null,
  handler: deleteShip,
});
