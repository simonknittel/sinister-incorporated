import { getApplicationContext, getRequestActor } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { listCitizensGroupedByVisibleRoles } from "@sam-monorepo/application";
import { cache } from "react";

export const getCitizensGroupedByVisibleRoles = cache(
  withTrace("getCitizensGroupedByVisibleRoles", async () =>
    listCitizensGroupedByVisibleRoles(
      getApplicationContext(),
      await getRequestActor(),
    ),
  ),
);
