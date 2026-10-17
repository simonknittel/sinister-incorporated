import { prisma } from "@/db";
import type { Citizen } from "@sam-monorepo/database/client";
import { VARIANT_TAG_SELECT } from "./shipQuery";

/** How many ships the citizen owns. */
export const countOwnerShips = (ownerId: Citizen["id"]) =>
  prisma.ship.count({
    where: {
      ownerId,
      deletedAt: null,
    },
  });

/** The tags of every variant that the citizen owns a ship of. */
export const getOwnerFleetVariantTags = (ownerId: Citizen["id"]) =>
  prisma.variantTag.findMany({
    where: {
      variants: {
        some: {
          ships: {
            some: {
              ownerId,
              deletedAt: null,
            },
          },
        },
      },
    },
    orderBy: [{ key: "asc" }, { value: "asc" }],
    select: VARIANT_TAG_SELECT,
  });
