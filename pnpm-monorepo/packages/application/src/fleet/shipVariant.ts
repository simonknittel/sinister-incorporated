import { VariantStatus } from "@sam-monorepo/database/browser";
import type { Prisma } from "@sam-monorepo/database/client";
import * as z from "zod";

/** The filter of the fleet lists by the status of the variant */
export enum FlightReadyFilter {
  All = "all",
  /** Only the variants that are flight ready */
  Yes = "yes",
  /** Only the variants that are marked as not flight ready */
  No = "no",
}

/** More filter values than this are not a real filter of the catalog */
const MAXIMUM_FILTER_IDS = 100;

/** Variant, series and manufacturer names are much shorter */
const MAXIMUM_QUERY_LENGTH = 100;

export const filterIdsSchema = z.array(z.cuid()).max(MAXIMUM_FILTER_IDS);

/** A part of a name, without regard to the case */
export const nameQuerySchema = z
  .string()
  .trim()
  .min(1)
  .max(MAXIMUM_QUERY_LENGTH);

/** The variant filter fields of the input schema of a fleet list */
export const variantFilterInputShape = {
  flight_ready: z.enum(FlightReadyFilter).default(FlightReadyFilter.All),
  manufacturer_ids: filterIdsSchema.default([]),
  variant_tag_ids: filterIdsSchema.default([]),
  /** A part of the variant name */
  query: nameQuerySchema.optional(),
};

interface VariantFilter {
  readonly flightReady: FlightReadyFilter;
  readonly variantTagIds?: string[];
  readonly manufacturerIds?: string[];
  /** A part of the variant name, without regard to the case */
  readonly query?: string | null;
}

const toStatusWhere = (
  flightReady: FlightReadyFilter,
): Prisma.VariantWhereInput => {
  switch (flightReady) {
    case FlightReadyFilter.All:
      return {};

    case FlightReadyFilter.Yes:
      return { status: VariantStatus.FLIGHT_READY };

    case FlightReadyFilter.No:
      return { status: VariantStatus.NOT_FLIGHT_READY };

    default:
      throw new Error(
        `Unknown flight ready filter: ${flightReady satisfies never}`,
      );
  }
};

/** The variant filter of the fleet lists and of the fleet filters of the app */
export const buildVariantFilterWhere = ({
  flightReady,
  variantTagIds = [],
  manufacturerIds = [],
  query,
}: VariantFilter): Prisma.VariantWhereInput => {
  const where = toStatusWhere(flightReady);

  if (variantTagIds.length > 0)
    where.tags = { some: { id: { in: variantTagIds } } };

  if (manufacturerIds.length > 0)
    where.series = { manufacturerId: { in: manufacturerIds } };

  if (query) where.name = { contains: query, mode: "insensitive" };

  return where;
};

/** A variant tag as the badges and the fleet filters show it */
export const VARIANT_TAG_SELECT = {
  id: true,
  key: true,
  value: true,
} as const satisfies Prisma.VariantTagSelect;

/**
 * A variant as the fleet lists show it. The fleet lists read every ship or
 * variant and paginate in memory, thus each column here is multiplied by the
 * whole table.
 */
export const SHIP_VARIANT_SELECT = {
  id: true,
  name: true,
  status: true,
  series: {
    select: {
      id: true,
      name: true,
      manufacturer: {
        select: {
          id: true,
          name: true,
          image: { select: { id: true, mimeType: true } },
        },
      },
    },
  },
  tags: {
    select: VARIANT_TAG_SELECT,
    orderBy: [{ key: "asc" }, { value: "asc" }],
  },
} as const satisfies Prisma.VariantSelect;

type ShipVariantRow = Prisma.VariantGetPayload<{
  select: typeof SHIP_VARIANT_SELECT;
}>;

export interface VariantTagOutput {
  readonly id: string;
  readonly key: string;
  readonly value: string;
}

export interface ShipVariantOutput {
  readonly id: string;
  readonly name: string;
  /** Null when nobody set the status of the variant */
  readonly status: VariantStatus | null;
  readonly series: {
    readonly id: string;
    readonly name: string;
  };
  readonly manufacturer: {
    readonly id: string;
    readonly name: string;
    /** The uploaded logo of the manufacturer */
    readonly logo: {
      readonly upload_id: string;
      readonly mime_type: string;
    } | null;
  };
  readonly tags: VariantTagOutput[];
}

export const toShipVariantOutput = (
  variant: ShipVariantRow,
): ShipVariantOutput => {
  const { manufacturer } = variant.series;

  return {
    id: variant.id,
    name: variant.name,
    status: variant.status,
    series: { id: variant.series.id, name: variant.series.name },
    manufacturer: {
      id: manufacturer.id,
      name: manufacturer.name,
      logo: manufacturer.image && {
        upload_id: manufacturer.image.id,
        mime_type: manufacturer.image.mimeType,
      },
    },
    tags: variant.tags.map((tag) => ({
      id: tag.id,
      key: tag.key,
      value: tag.value,
    })),
  };
};
