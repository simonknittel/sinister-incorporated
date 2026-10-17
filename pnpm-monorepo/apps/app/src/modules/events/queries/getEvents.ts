import { prisma } from "@/db";
import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import { getVisibleEventsWhere } from "@/modules/events/utils/eventVisibility";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  EventListStatus,
  EventParticipationFilter,
  EventTypeFilter,
  findEventListPage,
  getOpenEventsWhere,
  type EventListRow,
} from "@sam-monorepo/application";
import { CursorDirection } from "@sam-monorepo/domain";
import { forbidden } from "next/navigation";
import { cache } from "react";

const EVENTS_PAGE_SIZE = 10;

export type EventListItem = EventListRow;

/**
 * How many open events there are in total — for the dashboard tile, which
 * only lists the next few of them.
 */
export const getOpenEventCount = cache(
  withTrace("getOpenEventCount", async (): Promise<number> => {
    const authentication = await requireAuthentication();
    if (!(await authentication.authorize("event", "read"))) forbidden();

    return prisma.event.count({
      where: {
        AND: [getOpenEventsWhere(new Date()), await getVisibleEventsWhere()],
      },
    });
  }),
);

export const getEvents = cache(
  withTrace(
    "getEvents",
    async (
      status: EventListStatus = EventListStatus.Open,
      participating: EventParticipationFilter = EventParticipationFilter.All,
      type: EventTypeFilter = EventTypeFilter.All,
      cursor?: string | null,
      direction: CursorDirection = CursorDirection.Next,
    ) => {
      try {
        return await findEventListPage(
          getApplicationContext(),
          await getRequestActor(),
          {
            status,
            participating,
            type,
            limit: EVENTS_PAGE_SIZE,
            cursor: cursor ?? undefined,
          },
          { direction },
        );
      } catch (error) {
        return throwApplicationErrorForPage(error);
      }
    },
  ),
);
