import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { FleetCatalogErrorMessage } from "./fleetCatalogErrors.js";
import { SHIP_SELECT, toShipOutput, type ShipOutput } from "./ownerShips.js";
import { shipNameSchema } from "./ownShip.js";

export const createShipInputSchema = z.object({
  variant_id: idSchema.describe("The variant from search_ship_variants."),
  name: shipNameSchema.optional().describe("The name of the ship."),
});

/** Adds a ship of a variant to the fleet of the own citizen */
export const createShip = (
  context: ApplicationContext,
  actor: Actor,
  input: z.infer<typeof createShipInputSchema>,
): Promise<ShipOutput> =>
  withSpan(context, "createShip", async () => {
    requirePermission(actor, "ship", "manage");
    const owner = requireCitizen(actor);

    const variant = await context.prisma.variant.findUnique({
      where: { id: input.variant_id },
      select: { id: true },
    });
    if (!variant)
      throw new NotFoundError(FleetCatalogErrorMessage.VariantNotFound);

    const ship = await context.prisma.ship.create({
      data: {
        ownerId: owner.id,
        createdById: owner.id,
        variantId: variant.id,
        name: input.name,
      },
      select: SHIP_SELECT,
    });

    await context.audit.create([
      {
        type: AuditEventType.SHIP_CREATED_V2,
        data: { shipId: ship.id, ownerId: owner.id, variantId: variant.id },
        createdById: actor.userId,
      },
    ]);

    return toShipOutput(ship);
  });
