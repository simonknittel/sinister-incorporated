import type { Prisma } from "@sam-monorepo/database/client";
import { ACTIVE_CITIZEN_WHERE } from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ForbiddenError } from "../errors.js";
import { VARIANT_TAG_SELECT } from "./shipVariant.js";
import { canViewVariantPages } from "./variantPageAccess.js";

const VARIANT_MANUFACTURER_SELECT = {
  series: {
    select: {
      manufacturer: {
        select: {
          name: true,
          image: { select: { id: true, mimeType: true } },
        },
      },
    },
  },
} as const satisfies Prisma.VariantSelect;

const VARIANT_DETAIL_SELECT = {
  id: true,
  name: true,
  status: true,
  ...VARIANT_MANUFACTURER_SELECT,
  tags: { select: VARIANT_TAG_SELECT },
  externalLinks: { select: { id: true, serviceName: true, url: true } },
  _count: {
    select: {
      ships: { where: { deletedAt: null, owner: ACTIVE_CITIZEN_WHERE } },
    },
  },
} as const satisfies Prisma.VariantSelect;

/**
 * The head of the variant page. The count has the ships of all active
 * citizens that are not deleted, also of the citizens that are not members.
 */
export type VariantDetailRow = Prisma.VariantGetPayload<{
  select: typeof VARIANT_DETAIL_SELECT;
}>;

export interface FindVariantDetailInput {
  readonly variantId: string;
}

/**
 * The variant of the variant page and of its embedded wiki, or null when it
 * does not exist
 *
 * @throws ForbiddenError when the actor cannot see the variant pages
 */
export const findVariantDetail = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
  { variantId }: FindVariantDetailInput,
): Promise<VariantDetailRow | null> => {
  if (!canViewVariantPages(actor))
    throw new ForbiddenError(
      "One of the permissions ship;manage or orgFleet;read is missing",
    );

  return context.prisma.variant.findUnique({
    where: { id: variantId },
    select: VARIANT_DETAIL_SELECT,
  });
};

const VARIANT_BACKLINK_SELECT = {
  id: true,
  name: true,
  ...VARIANT_MANUFACTURER_SELECT,
} as const satisfies Prisma.VariantSelect;

/** A variant that embeds a wiki page */
export type VariantBacklinkRow = Prisma.VariantGetPayload<{
  select: typeof VARIANT_BACKLINK_SELECT;
}>;

export interface FindVariantBacklinksInput {
  readonly pageId: string;
}

/**
 * The variants that embed the wiki page as their root page (not as an
 * ancestor), by name. Empty when the actor cannot see the variant pages,
 * like the embed that the actor cannot open.
 */
export const findVariantBacklinks = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
  { pageId }: FindVariantBacklinksInput,
): Promise<VariantBacklinkRow[]> => {
  if (!canViewVariantPages(actor)) return [];

  return context.prisma.variant.findMany({
    where: { wikiPageId: pageId },
    select: VARIANT_BACKLINK_SELECT,
    orderBy: { name: "asc" },
  });
};
