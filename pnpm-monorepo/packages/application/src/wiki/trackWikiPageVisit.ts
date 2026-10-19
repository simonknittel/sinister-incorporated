import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { WikiPageAccessTier } from "./getAccessibleWikiPage.js";
import type { WikiSharedContextPage } from "./wikiContext.js";
import { WikiErrorMessage } from "./wikiErrors.js";
import { loadWikiScopeOfPage, requireAccessibleWikiPage } from "./wikiScope.js";

/** One hour: a page records at most one visit in this time */
const WIKI_VISIT_THROTTLE_MILLISECONDS = 60 * 60 * 1000;

export const trackWikiPageVisitInputSchema = z.object({
  page_id: idSchema,
});

export type TrackWikiPageVisitInput = z.output<
  typeof trackWikiPageVisitInputSchema
>;

export interface TrackWikiPageVisitOutput {
  readonly page_id: string;
  /** False when the throttle skipped the visit */
  readonly recorded: boolean;
}

/**
 * Records a page view for the list of recent pages. The app calls it from the
 * browser after the page mounted, not during the server render: a prefetch
 * renders pages that the user never opens, and a navigation from the prefetch
 * cache renders nothing. Throttled to one write per page and hour — the audit
 * event follows the same throttle and therefore counts visiting sessions, not
 * requests. Works in a briefing that is over, because a visit is personal
 * data.
 *
 * @throws ForbiddenError for a user without a citizen
 * @throws NotFoundError when a different user deleted the page or took the
 * read access away after the browser got the page, for example from its
 * back/forward cache
 */
export const trackWikiPageVisit = (
  context: ApplicationContext,
  actor: Actor,
  input: TrackWikiPageVisitInput,
): Promise<TrackWikiPageVisitOutput> =>
  withSpan(context, "trackWikiPageVisit", async () => {
    const citizenId = requireCitizen(actor).id;
    const now = context.now();

    /**
     * The throttle only reads the own rows of the actor, so it runs before the
     * permission check — repeat visits then skip loading the scope.
     */
    const existing = await context.prisma.wikiPageVisit.findUnique({
      where: { citizenId_pageId: { citizenId, pageId: input.page_id } },
      select: { lastVisitedAt: true },
    });
    if (
      existing &&
      existing.lastVisitedAt.getTime() >
        now.getTime() - WIKI_VISIT_THROTTLE_MILLISECONDS
    )
      return { page_id: input.page_id, recorded: false };

    const scope = await loadWikiScopeOfPage(context, actor, input.page_id);
    if (!scope) throw new NotFoundError(WikiErrorMessage.PageNotFound);

    const page = requireAccessibleWikiPage<WikiSharedContextPage>(
      scope,
      input.page_id,
      WikiPageAccessTier.Read,
    );

    await context.prisma.wikiPageVisit.upsert({
      where: { citizenId_pageId: { citizenId, pageId: page.id } },
      create: { citizenId, pageId: page.id, lastVisitedAt: now },
      update: { lastVisitedAt: now },
    });

    await context.audit.create([
      {
        type: AuditEventType.WIKI_PAGE_VISITED,
        data: { pageId: page.id, citizenId },
        createdById: actor.userId,
      },
    ]);

    return { page_id: page.id, recorded: true };
  });
