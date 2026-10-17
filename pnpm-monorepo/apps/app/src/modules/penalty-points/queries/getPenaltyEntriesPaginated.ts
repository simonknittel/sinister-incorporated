import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { CursorDirection } from "@/modules/common/CursorPagination/cursorPaginationParsers";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  listPenaltyEntries,
  PenaltyEntryStatus,
} from "@sam-monorepo/application";
import { cache } from "react";

const PENALTY_ENTRIES_PAGE_SIZE = 50;

export const getPenaltyEntriesPaginated = cache(
  withTrace(
    "getPenaltyEntriesPaginated",
    async (
      status: PenaltyEntryStatus = PenaltyEntryStatus.Active,
      cursor: string | null = null,
      direction: CursorDirection = CursorDirection.Next,
    ) => {
      try {
        const page = await listPenaltyEntries(
          getApplicationContext(),
          await getRequestActor(),
          {
            status,
            limit: PENALTY_ENTRIES_PAGE_SIZE,
            cursor: cursor ?? undefined,
          },
          { direction },
        );

        return {
          entries: page.entries,
          nextCursor: page.next_cursor,
          prevCursor: page.previous_cursor,
        };
      } catch (error) {
        return throwApplicationErrorForPage(error);
      }
    },
  ),
);
