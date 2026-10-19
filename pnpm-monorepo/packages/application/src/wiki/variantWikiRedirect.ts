import type { ApplicationContext } from "../context.js";
import type { WikiPageScope } from "./wikiScope.js";
import { WikiScopeKind } from "./wikiScopeKind.js";

/**
 * The linked page of the fleet variant when the page lies in the embed of
 * the variant, for the redirect of a write from inside the embed. Null when
 * the page is not in the global wiki, the variant is unknown or has no
 * linked page, or the page is outside the linked subtree: the caller then
 * uses the usual route of the page. The answer comes only from stored ids,
 * thus no user input reaches the redirect.
 *
 * @param parentId The parent of the page: a new page is not in the scope yet
 */
export const findVariantWikiRootPageId = async (
  context: Pick<ApplicationContext, "prisma">,
  scope: WikiPageScope,
  variantId: string,
  pageId: string,
  parentId: string | null,
): Promise<string | null> => {
  if (scope.kind !== WikiScopeKind.Wiki) return null;

  const variant = await context.prisma.variant.findUnique({
    where: { id: variantId },
    select: { wikiPageId: true },
  });
  const rootPageId = variant?.wikiPageId;
  if (!rootPageId) return null;

  /** A paste that replaces a page can replace the linked page itself */
  if (pageId === rootPageId) return rootPageId;

  const visited = new Set<string>();
  let currentId = parentId;
  while (currentId) {
    if (currentId === rootPageId) return rootPageId;
    if (visited.has(currentId)) return null;

    visited.add(currentId);
    currentId = scope.pagesById.get(currentId)?.parentId ?? null;
  }

  return null;
};
