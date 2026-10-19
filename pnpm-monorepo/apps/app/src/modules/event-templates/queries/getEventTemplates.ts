import { getApplicationContext, getRequestActor } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  EVENT_TEMPLATE_LIST_QUERY_MAXIMUM_LENGTH,
  findEventTemplateListRows,
  findEventTemplateOwners,
  type EventTemplateListFilters,
} from "@sam-monorepo/application";
import { cache } from "react";

/** The templates the current viewer may see, newest change first */
export const getEventTemplates = cache(
  withTrace("getEventTemplates", async (filters: EventTemplateListFilters) =>
    findEventTemplateListRows(
      getApplicationContext(),
      await getRequestActor(),
      {
        ...filters,
        // The search term comes straight from the URL
        query:
          filters.query?.slice(0, EVENT_TEMPLATE_LIST_QUERY_MAXIMUM_LENGTH) ??
          null,
      },
    ),
  ),
);

/** The owners for the owner filter of the list, for `event;manage` holders */
export const getEventTemplateOwners = cache(
  withTrace("getEventTemplateOwners", async () =>
    findEventTemplateOwners(getApplicationContext(), await getRequestActor()),
  ),
);
