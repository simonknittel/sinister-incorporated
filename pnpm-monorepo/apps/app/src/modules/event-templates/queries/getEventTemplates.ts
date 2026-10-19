import { getApplicationContext, getRequestActor } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findEventTemplateListRows,
  findEventTemplateOwners,
  type EventTemplateListFilters,
} from "@sam-monorepo/application";
import { cache } from "react";

export type { EventTemplateListEntry } from "@sam-monorepo/application";

/** The templates the current viewer may see, newest change first */
export const getEventTemplates = cache(
  withTrace("getEventTemplates", async (filters: EventTemplateListFilters) =>
    findEventTemplateListRows(
      getApplicationContext(),
      await getRequestActor(),
      filters,
    ),
  ),
);

/** The owners for the owner filter of the list, for `event;manage` holders */
export const getEventTemplateOwners = cache(
  withTrace("getEventTemplateOwners", async () =>
    findEventTemplateOwners(getApplicationContext(), await getRequestActor()),
  ),
);
