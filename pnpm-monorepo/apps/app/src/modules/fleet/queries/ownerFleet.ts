import { prisma } from "@/db";
import type { Citizen } from "@sam-monorepo/database/client";
import { VARIANT_TAG_SELECT } from "./shipQuery";

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
