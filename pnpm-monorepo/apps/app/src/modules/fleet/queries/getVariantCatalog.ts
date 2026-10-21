import { getApplicationContext } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findVariantCatalog } from "@sam-monorepo/application";
import { cache } from "react";

export type {
  VariantCatalogManufacturer,
  VariantCatalogVariant,
} from "@sam-monorepo/application";

/** See `findVariantCatalog()` */
export const getVariantCatalog = cache(
  withTrace("getVariantCatalog", async () =>
    findVariantCatalog(getApplicationContext()),
  ),
);
