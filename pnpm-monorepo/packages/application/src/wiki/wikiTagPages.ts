import { wikiContainerColumns } from "@sam-monorepo/domain";
import { buildWikiPageHref } from "@sam-monorepo/wiki-editor/helpers";
import type { ApplicationContext } from "../context.js";
import { hasReadableEventWikiRoot } from "./eventWikiContext.js";
import {
  getAccessibleWikiPage,
  WikiPageAccessTier,
} from "./getAccessibleWikiPage.js";
import { buildVisibleWikiBreadcrumb } from "./wikiBreadcrumb.js";
import type { WikiSharedContextPage } from "./wikiContext.js";
import type { WikiPageScope } from "./wikiScope.js";
import { WikiScopeKind } from "./wikiScopeKind.js";

export interface WikiTagPage {
  /** The route of the page, relative to the base URL of the app */
  readonly href: string;
  readonly title: string;
  readonly iconId: string | null;
  /** Titles of the visible, not-deleted ancestors, root first */
  readonly breadcrumb: string[];
}

export interface WikiTagPages {
  readonly name: string;
  /** The pages that the actor can read, by title */
  readonly pages: WikiTagPage[];
}

/**
 * The name of a tag of the scope and its pages that the actor can read. A
 * scope helper: the scope comes from a scope builder of this package for the
 * same actor. The tag name itself is not gated (it also appears in the
 * autocomplete), but the page list is: invisible and deleted pages are
 * omitted.
 *
 * @returns null when the tag does not exist in the scope, or when the
 * briefing is hidden from the actor
 */
export const findWikiTagPages = async (
  context: Pick<ApplicationContext, "prisma">,
  scope: WikiPageScope,
  { tagId }: { readonly tagId: string },
): Promise<WikiTagPages | null> => {
  /**
   * A briefing without a root page that the actor can read does not exist
   * for the actor (see `hasReadableEventWikiRoot()`)
   */
  if (scope.kind === WikiScopeKind.Briefing && !hasReadableEventWikiRoot(scope))
    return null;

  const container =
    scope.kind === WikiScopeKind.Briefing ? scope.container : null;
  const tag = await context.prisma.wikiTag.findFirst({
    /** Both container columns NULL is what makes a tag global */
    where: { id: tagId, ...wikiContainerColumns(container) },
    select: { name: true, pages: { select: { pageId: true } } },
  });
  if (!tag) return null;

  const pages = tag.pages
    .map((assignment) =>
      getAccessibleWikiPage<WikiSharedContextPage>(
        scope,
        assignment.pageId,
        WikiPageAccessTier.Read,
      ),
    )
    .filter((page) => page !== null)
    .toSorted((first, second) => first.title.localeCompare(second.title))
    .map((page) => ({
      href: buildWikiPageHref(scope.hrefBase, page),
      title: page.title,
      iconId: page.iconId,
      breadcrumb: buildVisibleWikiBreadcrumb(scope, page),
    }));

  return { name: tag.name, pages };
};
