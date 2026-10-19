import "server-only";

import { getApplicationContext, getRequestActor } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findOwnSeasonalThemeSettings } from "@sam-monorepo/application";
import { cache } from "react";

/**
 * The opt-out rows of the viewer. A row means the citizen switched the
 * event off; an event without a row is switched on. A viewer without a
 * citizen has no rows and cannot create any, thus the query answers with
 * nothing.
 */
export const getMySeasonalThemeSettings = cache(
  withTrace("getMySeasonalThemeSettings", async () =>
    findOwnSeasonalThemeSettings(
      getApplicationContext(),
      await getRequestActor(),
    ),
  ),
);
