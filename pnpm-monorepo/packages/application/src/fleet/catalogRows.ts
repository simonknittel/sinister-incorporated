import type { Prisma } from "@sam-monorepo/database/client";
import { ACTIVE_CITIZEN_WHERE } from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";

// The catalog of the fleet is not secret, and its callers have different
// gates (the fleet pages, the lineups of the events and the templates, the
// wiki editor). Thus the helpers of this file take no actor and check no
// permission: the callers check it.

/** An uploaded image, for example the logo of a manufacturer */
export const UPLOAD_IMAGE_SELECT = {
  id: true,
  mimeType: true,
} as const satisfies Prisma.UploadSelect;

/** The name and the logo of the manufacturer of a variant */
export const VARIANT_MANUFACTURER_SELECT = {
  series: {
    select: {
      manufacturer: {
        select: { name: true, image: { select: UPLOAD_IMAGE_SELECT } },
      },
    },
  },
} as const satisfies Prisma.VariantSelect;

export const VARIANT_EXTERNAL_LINK_SELECT = {
  id: true,
  serviceName: true,
  url: true,
} as const satisfies Prisma.VariantExternalLinkSelect;

/**
 * The ships that the counts of a variant include: the ships of the active
 * citizens that are not deleted
 */
export const ACTIVE_OWNER_SHIP_WHERE = {
  deletedAt: null,
  owner: ACTIVE_CITIZEN_WHERE,
} as const satisfies Prisma.ShipWhereInput;

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
 * All manufacturers with their variants, for the pickers of the ships and of
 * the required variants. The pickers group the variants by the name of the
 * manufacturer and show the id and the name of each variant. The catalog has
 * no limit and goes into a client component on each page that uses it, thus
 * the select has only these fields.
 */
export const findVariantCatalog = (
  context: Pick<ApplicationContext, "prisma">,
): Promise<VariantCatalogManufacturer[]> =>
  context.prisma.manufacturer.findMany({ select: VARIANT_CATALOG_SELECT });

/** The name of a variant and the name and the logo of its manufacturer */
export const VARIANT_LINK_SELECT = {
  id: true,
  name: true,
  ...VARIANT_MANUFACTURER_SELECT,
} as const satisfies Prisma.VariantSelect;

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
    select: VARIANT_LINK_SELECT,
    orderBy: { name: "asc" },
  });

  return variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    manufacturerName: variant.series.manufacturer.name,
    manufacturerImage: variant.series.manufacturer.image,
  }));
};
