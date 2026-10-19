import type { ApplicationContext } from "../context.js";
import { WikiPageAccessTier } from "./getAccessibleWikiPage.js";
import { requireAccessibleWikiPage, type WikiScope } from "./wikiScope.js";

/**
 * The tags of a page, by name. A scope helper: the scope comes from a scope
 * builder of this package for the same actor.
 *
 * @throws NotFoundError when the page is not in the scope, is in the trash
 * or the actor cannot read it
 */
export const findWikiPageTags = async (
  context: Pick<ApplicationContext, "prisma">,
  scope: WikiScope,
  pageId: string,
): Promise<{ readonly id: string; readonly name: string }[]> => {
  requireAccessibleWikiPage(scope, pageId, WikiPageAccessTier.Read);

  const assignments = await context.prisma.wikiPageTag.findMany({
    where: { pageId },
    select: { tag: { select: { id: true, name: true } } },
    orderBy: { tag: { name: "asc" } },
  });

  return assignments.map(({ tag }) => ({ id: tag.id, name: tag.name }));
};
