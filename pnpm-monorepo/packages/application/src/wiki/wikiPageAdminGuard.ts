import { isEventWikiRootPage } from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../errors.js";
import type { EventWikiContextPage } from "./eventWikiContext.js";
import type { WikiContextPage } from "./wikiContext.js";
import { WikiErrorMessage } from "./wikiErrors.js";
import {
  isWikiScopeFrozen,
  loadWikiScopeOfPage,
  type WikiPageScope,
} from "./wikiScope.js";

/** A page of the global wiki or of a briefing */
export type AdministrableWikiPage = WikiContextPage | EventWikiContextPage;

interface AdministrableWikiPageOptions {
  /** Restore and destroy work on a page in the trash, not on a live page */
  readonly expectDeleted?: boolean;
  /** The structural changes refuse the locked root page of a briefing */
  readonly rejectBriefingRoot?: boolean;
}

/**
 * The guard of the page tree operations: the page exists in the expected
 * trash state, the actor manages it, and its scope is not frozen. Gives the
 * scope of the page with the page.
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
  readonly page: AdministrableWikiPage;
}> => {
  const scope = await loadWikiScopeOfPage(context, actor, pageId);
  const page = scope?.pagesById.get(pageId);
  if (!scope || !page) throw new NotFoundError(WikiErrorMessage.PageNotFound);

  if ((page.deletedAt !== null) !== expectDeleted)
    throw new NotFoundError(WikiErrorMessage.PageNotFound);

  if (!scope.permissions.get(page.id)?.canAdmin)
    throw new ForbiddenError("The user does not manage the page");

  if (isWikiScopeFrozen(scope))
    throw new ConflictError(WikiErrorMessage.BriefingFrozen);

  if (rejectBriefingRoot && isEventWikiRootPage(page))
    throw new ValidationError("The root page of a briefing is locked");

  return { scope, page };
};
