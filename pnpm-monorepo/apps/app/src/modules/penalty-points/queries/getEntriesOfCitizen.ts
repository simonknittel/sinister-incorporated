import {
  getApplicationContext,
  throwApplicationErrorForPage,
  toActor,
} from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  listPenaltyEntries,
  PageDirection,
  PenaltyEntryStatus,
  type PenaltyEntryOutput,
} from "@sam-monorepo/application";
import { type Citizen } from "@sam-monorepo/database/client";
import { toPenaltyEntryRow } from "../utils/toPenaltyEntryRow";

/** The maximum limit of `listPenaltyEntries` */
const PAGE_SIZE = 100;

/** All entries of the citizen: the tab of the citizen has no pagination */
export const getEntriesOfCitizen = withTrace(
  "getEntriesOfCitizen",
  async (citizenId: Citizen["id"], expired: "active" | "all" = "active") => {
    const { session } = await requireAuthentication();
    const context = getApplicationContext();
    const actor = await toActor(session);

    const entries: PenaltyEntryOutput[] = [];
    let cursor: string | undefined;

    try {
      do {
        const page = await listPenaltyEntries(context, actor, {
          status:
            expired === "active"
              ? PenaltyEntryStatus.Active
              : PenaltyEntryStatus.NotDeleted,
          citizen_id: citizenId,
          limit: PAGE_SIZE,
          cursor,
          direction: PageDirection.Next,
        });

        entries.push(...page.entries);
        cursor = page.next_cursor ?? undefined;
      } while (cursor);
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }

    return entries.map(toPenaltyEntryRow);
  },
);
