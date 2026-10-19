import type {
  WikiSharedContext,
  WikiSharedContextPage,
} from "./wikiContext.js";

/**
 * The titles of the ancestors of a page, from the root down to the direct
 * parent. Deleted ancestors are skipped. Unreadable ancestors cannot occur,
 * because a page grants nothing to someone who cannot read the page above it.
 */
export const buildVisibleWikiBreadcrumb = (
  scope: Pick<WikiSharedContext, "pagesById" | "permissions">,
  page: Pick<WikiSharedContextPage, "id" | "parentId">,
): string[] => {
  const titles: string[] = [];
  const visited = new Set<string>([page.id]);
  let current = page.parentId ? scope.pagesById.get(page.parentId) : undefined;

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    if (
      current.deletedAt === null &&
      scope.permissions.get(current.id)?.canRead
    )
      titles.unshift(current.title);
    current = current.parentId
      ? scope.pagesById.get(current.parentId)
      : undefined;
  }

  return titles;
};
