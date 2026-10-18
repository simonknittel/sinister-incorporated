import { getApplicationContext, getRequestActor } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { listCitizenIdsWithBirthdayToday } from "@sam-monorepo/application";
import { cache } from "react";

/**
 * The ids of the citizens who have the birthday today. The app shell loads
 * them one time for each request and gives them to the browser, thus a
 * citizen link can wear the party hat without its own query (see
 * `BirthdayCitizensProvider`).
 */
export const getCitizenIdsWithBirthdayToday = cache(
  withTrace("getCitizenIdsWithBirthdayToday", async () =>
    listCitizenIdsWithBirthdayToday(
      getApplicationContext(),
      await getRequestActor(),
    ),
  ),
);
