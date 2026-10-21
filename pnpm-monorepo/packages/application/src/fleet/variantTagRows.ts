import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  VARIANT_TAG_ORDER,
  VARIANT_TAG_SELECT,
  type VariantTagOutput,
} from "./shipVariant.js";

/** All variant tags, for the filter of the fleet of the organization */
export const findOrgFleetVariantTags = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
): Promise<VariantTagOutput[]> => {
  requirePermission(actor, "orgFleet", "read");

  return context.prisma.variantTag.findMany({
    orderBy: VARIANT_TAG_ORDER,
    select: VARIANT_TAG_SELECT,
  });
};

/** The tags of every variant that the citizen owns a ship of */
const findOwnerFleetVariantTags = (
  context: Pick<ApplicationContext, "prisma">,
  ownerId: string,
): Promise<VariantTagOutput[]> =>
  context.prisma.variantTag.findMany({
    where: {
      variants: { some: { ships: { some: { ownerId, deletedAt: null } } } },
    },
    orderBy: VARIANT_TAG_ORDER,
    select: VARIANT_TAG_SELECT,
  });

/**
 * The tags of the variants of the own ships, for the filter of the own
 * fleet. A user without a citizen has no ships.
 */
export const findOwnFleetVariantTags = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
): Promise<VariantTagOutput[]> => {
  requirePermission(actor, "ship", "read");

  if (!actor.citizen) return [];

  return findOwnerFleetVariantTags(context, actor.citizen.id);
};

/** The tags of the variants of the ships of a citizen, for its fleet page */
export const findCitizenFleetVariantTags = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
  { citizenId }: { readonly citizenId: string },
): Promise<VariantTagOutput[]> => {
  requirePermission(actor, "otherShips", "read");

  return findOwnerFleetVariantTags(context, citizenId);
};
