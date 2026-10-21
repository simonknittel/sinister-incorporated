import type { Prisma } from "@sam-monorepo/database/client";
import type { ApplicationContext } from "../context.js";

// The catalog of the fleet is not secret, and its callers have different
// gates (the fleet pages, the lineups of the events and the templates, the
// wiki editor). Thus the helpers of this file take no actor and check no
// permission: the callers check it.

const UPLOAD_IMAGE_SELECT = {
  id: true,
  mimeType: true,
} as const satisfies Prisma.UploadSelect;

const MANUFACTURER_ROW_SELECT = {
  id: true,
  imageId: true,
  image: { select: UPLOAD_IMAGE_SELECT },
  name: true,
  series: { select: { id: true, name: true }, orderBy: { name: "asc" } },
} as const satisfies Prisma.ManufacturerSelect;

/** A manufacturer with its series, for the settings and the fleet filters */
export type ManufacturerRow = Prisma.ManufacturerGetPayload<{
  select: typeof MANUFACTURER_ROW_SELECT;
}>;

/** All manufacturers with their series, sorted by name */
export const findManufacturerRows = (
  context: Pick<ApplicationContext, "prisma">,
): Promise<ManufacturerRow[]> =>
  context.prisma.manufacturer.findMany({
    select: MANUFACTURER_ROW_SELECT,
    orderBy: { name: "asc" },
  });

const VARIANT_CATALOG_SELECT = {
  id: true,
  name: true,
  series: {
    select: {
      name: true,
      variants: { select: { id: true, name: true } },
    },
  },
} as const satisfies Prisma.ManufacturerSelect;

export type VariantCatalogManufacturer = Prisma.ManufacturerGetPayload<{
  select: typeof VARIANT_CATALOG_SELECT;
}>;

/** One selectable variant of the catalog above */
export type VariantCatalogVariant =
  VariantCatalogManufacturer["series"][number]["variants"][number];

/**
 * Every manufacturer with its variants, for the ship and required-variant
 * pickers. The pickers group by manufacturer name and offer variants by id
 * and name, so nothing else is fetched — the catalog is unbounded and is
 * serialized into a client component wherever it is used.
 */
export const findVariantCatalog = (
  context: Pick<ApplicationContext, "prisma">,
): Promise<VariantCatalogManufacturer[]> =>
  context.prisma.manufacturer.findMany({ select: VARIANT_CATALOG_SELECT });

/** A variant that a wiki page can link to */
export interface VariantLinkOption {
  readonly id: string;
  readonly name: string;
  readonly manufacturerName: string;
  readonly manufacturerImage: {
    readonly id: string;
    readonly mimeType: string;
  } | null;
}

/**
 * All variants with their manufacturer, sorted by name, for the variant link
 * picker of the wiki and for the links that a different user inserted after
 * the page loaded. Variant links render for every authenticated user (only
 * the variant page itself has the fleet gate), thus the list has no fleet
 * gate.
 */
export const findVariantLinkOptions = async (
  context: Pick<ApplicationContext, "prisma">,
): Promise<VariantLinkOption[]> => {
  const variants = await context.prisma.variant.findMany({
    select: {
      id: true,
      name: true,
      series: {
        select: {
          manufacturer: {
            select: { name: true, image: { select: UPLOAD_IMAGE_SELECT } },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    manufacturerName: variant.series.manufacturer.name,
    manufacturerImage: variant.series.manufacturer.image,
  }));
};
