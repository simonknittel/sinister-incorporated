import * as z from "zod";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";

/** The length of the name field of the forms */
const MAXIMUM_SHIP_NAME_LENGTH = 255;

/** The name that the owner gives a ship. The forms permit an empty name. */
export const shipNameSchema = z.string().trim().max(MAXIMUM_SHIP_NAME_LENGTH);

/**
 * The ship of the owner that is not deleted. A ship of a different citizen
 * does not exist for the owner.
 *
 * @throws NotFoundError when the owner has no such ship
 */
export const requireOwnShip = async (
  context: ApplicationContext,
  ownerId: string,
  shipId: string,
) => {
  const ship = await context.prisma.ship.findFirst({
    where: { id: shipId, ownerId, deletedAt: null },
    select: { name: true },
  });
  if (!ship) throw new NotFoundError("The ship does not exist");

  return ship;
};
