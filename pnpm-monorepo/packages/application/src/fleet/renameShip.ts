import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { SHIP_SELECT, toShipOutput, type ShipOutput } from "./ownerShips.js";
import { requireOwnShip, shipNameSchema } from "./ownShip.js";

export const renameShipInputSchema = z.object({
  ship_id: idSchema.describe("An own ship from list_my_ships."),
  name: shipNameSchema.describe(
    "The new name. An empty name removes the name.",
  ),
});

/** Changes the name of a ship of the own citizen */
export const renameShip = (
  context: ApplicationContext,
  actor: Actor,
  input: z.infer<typeof renameShipInputSchema>,
): Promise<ShipOutput> =>
  withSpan(context, "renameShip", async () => {
    requirePermission(actor, "ship", "manage");
    const owner = requireCitizen(actor);

    const previousShip = await requireOwnShip(context, owner.id, input.ship_id);

    const ship = await context.prisma.ship.update({
      where: { id: input.ship_id, ownerId: owner.id },
      data: { name: input.name, updatedById: owner.id },
      select: SHIP_SELECT,
    });

    await context.audit.create([
      {
        type: AuditEventType.SHIP_UPDATED_V2,
        data: {
          shipId: ship.id,
          ownerId: owner.id,
          previousName: previousShip.name,
          newName: ship.name,
        },
        createdById: actor.userId,
      },
    ]);

    return toShipOutput(ship);
  });
