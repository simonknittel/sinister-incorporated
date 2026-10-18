import { getApplicationContext, getRequestActor } from "@/modules/application";
import { listCitizensGroupedByVisibleRoles } from "@sam-monorepo/application";
import { cache } from "react";

export const getCitizensGroupedByVisibleRoles = cache(async () =>
  listCitizensGroupedByVisibleRoles(
    getApplicationContext(),
    await getRequestActor(),
  ),
);
