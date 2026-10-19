import { AuditEventType } from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";

/**
 * The days that a wiki page stays in the trash before the nightly purge
 * deletes it. The trash texts of the app promise this period.
 */
export const WIKI_TRASH_RETENTION_DAYS = 30;

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export interface PurgeTrashedWikiPagesOutput {
  readonly purgedPageCount: number;
}

/**
 * Permanently deletes the wiki pages that were in the trash for more than
 * `WIKI_TRASH_RETENTION_DAYS` days. The parent of a page is a restricting
 * foreign key, thus the pages go leaves-first: repeatedly delete the
 * expired pages without a remaining child until no page is left. A child
 * goes to the trash together with its ancestors or before them, thus an
 * expired parent cannot have a child that is not expired.
 */
export const purgeTrashedWikiPages = (
  context: ApplicationContext,
): Promise<PurgeTrashedWikiPagesOutput> =>
  withSpan(context, "purgeTrashedWikiPages", async () => {
    const cutoff = new Date(
      context.now().getTime() -
        WIKI_TRASH_RETENTION_DAYS * MILLISECONDS_PER_DAY,
    );

    let purgedPageCount = 0;

    for (;;) {
      const deletablePages = await context.prisma.wikiPage.findMany({
        where: {
          deletedAt: { lt: cutoff },
          children: { none: {} },
        },
        select: { id: true },
      });
      if (deletablePages.length <= 0) break;

      /**
       * The condition on `deletedAt` is part of the delete, thus a page
       * that a user restored after the read stays
       */
      const { count } = await context.prisma.wikiPage.deleteMany({
        where: {
          id: { in: deletablePages.map((page) => page.id) },
          deletedAt: { lt: cutoff },
        },
      });
      purgedPageCount += count;
    }

    if (purgedPageCount > 0) {
      await context.audit.create([
        {
          type: AuditEventType.TRASHED_WIKI_PAGES_PURGED,
          data: { count: purgedPageCount },
          createdById: null,
        },
      ]);
    }

    return { purgedPageCount };
  });
