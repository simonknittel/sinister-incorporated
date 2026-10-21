import { isEventWikiRootPage, WikiScopeKind } from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ConflictError, ValidationError } from "../errors.js";
import { WikiPageAccessTier } from "./getAccessibleWikiPage.js";
import type { WikiSharedContextPage } from "./wikiContext.js";
import { WikiErrorMessage } from "./wikiErrors.js";
import {
  isWikiScopeFrozen,
  requireWikiPageOfScope,
  type WikiPageScope,
} from "./wikiScope.js";

interface AdministrableWikiPageOptions {
  /** Restore and destroy work on a page in the trash, not on a live page */
  readonly expectDeleted?: boolean;
  /** The structural changes refuse the locked root page of a briefing */
  readonly rejectBriefingRoot?: boolean;
}

/**
 * The guard of the page tree operations: `requireWikiPageOfScope()` with the
 * admin tier, and the scope of the page is not frozen
 *
 * @throws NotFoundError when the scope or the page does not exist for the
 * actor, or when the page is not in the expected trash state: a different
 * user or tab changed the page before
 * @throws ForbiddenError when the actor does not manage the page
 * @throws ConflictError when the event of the briefing is over
 * @throws ValidationError for the root page of a briefing with
 * `rejectBriefingRoot`
 */
export const requireAdministrableWikiPage = async (
  context: ApplicationContext,
  actor: Actor,
  pageId: string,
  {
    expectDeleted = false,
    rejectBriefingRoot = false,
  }: AdministrableWikiPageOptions = {},
): Promise<{
  readonly scope: WikiPageScope;
  readonly page: WikiSharedContextPage;
}> => {
  const { scope, page } = await requireWikiPageOfScope(
    context,
    actor,
    pageId,
    WikiPageAccessTier.Admin,
    { expectDeleted },
  );

  if (isWikiScopeFrozen(scope))
    throw new ConflictError(WikiErrorMessage.BriefingFrozen);

  if (rejectBriefingRoot && isEventWikiRootPage(page))
    throw new ValidationError("The root page of a briefing is locked");

  return { scope, page };
};

/**
 * An import puts any node structure into the page, thus the import and its
 * counterpart, the export, are tools of the administrators: `wiki;manage`
 * in the global wiki, the administrators of the page in a briefing.
 */
export const canTransferWikiPageContent = (
  actor: Pick<Actor, "authorize">,
  scope: WikiPageScope,
  pageId: string,
) => {
  switch (scope.kind) {
    case WikiScopeKind.Wiki:
      return actor.authorize("wiki", "manage");

    case WikiScopeKind.Briefing:
      return scope.permissions.get(pageId)?.canAdmin === true;

    default:
      throw new Error(`Unknown wiki page scope: ${scope satisfies never}`);
  }
};
