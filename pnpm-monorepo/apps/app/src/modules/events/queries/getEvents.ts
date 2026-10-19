import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  countOpenEvents,
  EventListStatus,
  EventParticipationFilter,
  EventTypeFilter,
  findEventListPage,
  UnknownCursorBehavior,
  type EventListRow,
} from "@sam-monorepo/application";
import { CursorDirection } from "@sam-monorepo/domain";
import { cache } from "react";

const EVENTS_PAGE_SIZE = 10;

export type EventListItem = EventListRow;

/**
 * How many open events there are in total — for the dashboard tile, which
 * only lists the next few of them.
 */
export const getOpenEventCount = cache(
  withTrace("getOpenEventCount", async (): Promise<number> => {
    try {
      return await countOpenEvents(
        getApplicationContext(),
        await getRequestActor(),
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);

/**
 * One page of the events list. A stale cursor in the URL (its event is gone
 * or not visible anymore) shows the first page, or the last page for the
 * previous direction.
 */
export const getEvents = cache(
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
        { direction, unknownCursor: UnknownCursorBehavior.FirstPage },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  },
);
