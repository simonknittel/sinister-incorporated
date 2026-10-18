import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { CursorDirection } from "@/modules/common/CursorPagination/cursorPaginationParsers";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findSilcTransactionTablePage,
  UnknownCursorBehavior,
} from "@sam-monorepo/application";
import { cache } from "react";

const SILC_TRANSACTIONS_PAGE_SIZE = 100;

export const getSilcTransactionsPaginated = cache(
  withTrace(
    "getSilcTransactionsPaginated",
    async (
      showDeleted: "alle" | "deleted" = "alle",
      cursor: string | null = null,
      direction: CursorDirection = CursorDirection.Next,
    ) => {
      try {
        return await findSilcTransactionTablePage(
          getApplicationContext(),
          await getRequestActor(),
          { deleted: showDeleted === "deleted", cursor },
          {
            pageSize: SILC_TRANSACTIONS_PAGE_SIZE,
            direction,
            unknownCursor: UnknownCursorBehavior.FirstPage,
          },
        );
      } catch (error) {
        return throwApplicationErrorForPage(error);
      }
    },
  ),
);
