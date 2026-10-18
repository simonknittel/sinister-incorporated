import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  listUpcomingBirthdays,
  UPCOMING_BIRTHDAYS_HANDLE_QUERY_MAX_LENGTH,
} from "@sam-monorepo/application";
import { cache } from "react";

export type { UpcomingBirthday } from "@sam-monorepo/application";

/** The birthday list of the Spynet (see `listUpcomingBirthdays`) */
export const getUpcomingBirthdays = cache(
  withTrace(
    "getUpcomingBirthdays",
    async (handleQuery: string | null = null) => {
      try {
        return await listUpcomingBirthdays(
          getApplicationContext(),
          await getRequestActor(),
          {
            // The query comes from the URL, thus it can be longer
            handle_query:
              handleQuery?.slice(
                0,
                UPCOMING_BIRTHDAYS_HANDLE_QUERY_MAX_LENGTH,
              ) ?? null,
          },
        );
      } catch (error) {
        return throwApplicationErrorForPage(error);
      }
    },
  ),
);
