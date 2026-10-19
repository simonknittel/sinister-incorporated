import { wikiContainerColumns } from "@sam-monorepo/domain";
import { buildWikiPageHref } from "@sam-monorepo/wiki-editor/helpers";
import type { ApplicationContext } from "../context.js";
import {
  getAccessibleWikiPage,
  WikiPageAccessTier,
} from "./getAccessibleWikiPage.js";
import { buildVisibleWikiBreadcrumb } from "./wikiBreadcrumb.js";
import {
  getWikiPageScopeContainer,
  isHiddenBriefing,
  type WikiPageScope,
} from "./wikiScope.js";

export interface WikiTagPage {
  /** The route of the page, relative to the base URL of the app */
  readonly href: string;
  readonly title: string;
  readonly iconId: string | null;
  /** Titles of the visible ancestors that are not in the trash, top first */
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
 * same actor. The name of the tag has no gate (the autocomplete also shows
 * it), but the list of the pages has one: it does not include the pages
 * that the actor cannot read and the pages in the trash.
 *
 * @returns null when the tag does not exist in the scope, or when the
 * briefing is hidden from the actor
 */
export const findWikiTagPages = async (
  context: Pick<ApplicationContext, "prisma">,
  scope: WikiPageScope,
  tagId: string,
): Promise<WikiTagPages | null> => {
  if (isHiddenBriefing(scope)) return null;

  const tag = await context.prisma.wikiTag.findFirst({
    /** A global tag has no container: both container columns are null */
    where: {
      id: tagId,
      ...wikiContainerColumns(getWikiPageScopeContainer(scope)),
    },
    select: { name: true, pages: { select: { pageId: true } } },
  });
  if (!tag) return null;

  const pages = tag.pages
    .map((assignment) =>
      getAccessibleWikiPage(scope, assignment.pageId, WikiPageAccessTier.Read),
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
