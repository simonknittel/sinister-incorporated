import {
  getApplicationContext,
  throwApplicationErrorForPage,
  toActor,
} from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import { CursorDirection } from "@/modules/common/CursorPagination/cursorPaginationParsers";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  listPenaltyEntries,
  PageDirection,
  PenaltyEntryStatus,
} from "@sam-monorepo/application";
import { cache } from "react";
import { toPenaltyEntryRow } from "../utils/toPenaltyEntryRow";

const PENALTY_ENTRIES_PAGE_SIZE = 50;

export const getPenaltyEntriesPaginated = cache(
  withTrace(
    "getPenaltyEntriesPaginated",
    async (
      status: PenaltyEntryStatus = PenaltyEntryStatus.Active,
      cursor: string | null = null,
      direction: CursorDirection = CursorDirection.Next,
    ) => {
      const { session } = await requireAuthentication();

      try {
        const page = await listPenaltyEntries(
          getApplicationContext(),
          await toActor(session),
          {
            status,
            limit: PENALTY_ENTRIES_PAGE_SIZE,
            cursor: cursor ?? undefined,
            direction:
              direction === CursorDirection.Prev
                ? PageDirection.Previous
                : PageDirection.Next,
          },
        );

        return {
          entries: page.entries.map(toPenaltyEntryRow),
          nextCursor: page.next_cursor,
          prevCursor: page.previous_cursor,
        };
      } catch (error) {
        return throwApplicationErrorForPage(error);
      }
    },
  ),
);
