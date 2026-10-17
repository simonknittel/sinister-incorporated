import type { Prisma } from "@sam-monorepo/database/client";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ForbiddenError } from "../errors.js";
import { pageInputShape } from "./pagination.js";
import {
  nameQuerySchema,
  SHIP_VARIANT_SELECT,
  toShipVariantOutput,
  type ShipVariantOutput,
} from "./shipVariant.js";

export const searchShipVariantsInputSchema = z.object({
  /** A part of the name of the variant, of its series or of its manufacturer */
  query: nameQuerySchema.optional(),
  manufacturer_id: z.cuid().optional(),
  limit: pageInputShape.limit,
});

export interface SearchShipVariantsOutput {
  readonly variants: ShipVariantOutput[];
}

/**
 * The catalog is not secret, but only the features that use ship variants
 * need it: the own ships, the fleet of the organization and the lineups of
 * the events.
 */
export const canSearchShipVariants = (actor: Actor) =>
  actor.authorize("ship", "read") ||
  actor.authorize("orgFleet", "read") ||
  actor.authorize("event", "read");

/** The variants of the catalog that agree with the query, sorted by name */
export const searchShipVariants = async (
  context: ApplicationContext,
  actor: Actor,
  input: z.infer<typeof searchShipVariantsInputSchema>,
): Promise<SearchShipVariantsOutput> => {
  if (!canSearchShipVariants(actor))
    throw new ForbiddenError(
      "One of the permissions ship;read, orgFleet;read or event;read is missing",
    );

  const where: Prisma.VariantWhereInput = {};

  if (input.manufacturer_id)
    where.series = { manufacturerId: input.manufacturer_id };

  if (input.query) {
    const contains = { contains: input.query, mode: "insensitive" } as const;

    where.OR = [
      { name: contains },
      { series: { name: contains } },
      { series: { manufacturer: { name: contains } } },
    ];
  }

  const variants = await context.prisma.variant.findMany({
    where,
    select: SHIP_VARIANT_SELECT,
    orderBy: [{ name: "asc" }, { id: "asc" }],
    take: input.limit,
  });

  return { variants: variants.map(toShipVariantOutput) };
};
