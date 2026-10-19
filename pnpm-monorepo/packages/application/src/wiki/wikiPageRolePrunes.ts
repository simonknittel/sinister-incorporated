import {
  createWikiPageRoleResolvers,
  type WikiPagePermissionSource,
  type WikiPermissionRole,
} from "@sam-monorepo/domain";

export interface WikiPageRolePrune {
  readonly pageId: string;
  readonly roleIds: string[];
}

/**
 * Finds the role access entries that give nothing, because the role cannot
 * read the parent of the page. A page never gives more than the page above
 * it. Such entries would come back to life when the parent widens again,
 * thus the callers delete them and report what they removed. The read, edit
 * and manage entries have the same criterion, thus a pruned role loses all
 * of its entries on that page.
 *
 * Give the page data as it is AFTER the change (for example a permission
 * update): the prunes come from it. One pass is sufficient also for deep
 * subtrees: the resolver requires read access on all ancestors, thus the
 * same pass finds an entry below a pruned entry.
 */
export const collectWikiPageRolePrunes = (
  pages: readonly WikiPagePermissionSource[],
  roles: readonly WikiPermissionRole[],
  pageIds: readonly string[],
): WikiPageRolePrune[] => {
  const pagesById = new Map(pages.map((page) => [page.id, page]));
  const resolvers = createWikiPageRoleResolvers(pages, roles);

  const prunes: WikiPageRolePrune[] = [];

  for (const pageId of pageIds) {
    const page = pagesById.get(pageId);
    if (!page?.parentId) continue;

    /**
     * The resolver counts a page whose parent is not in the data as a
     * top-level page, thus there is nothing to narrow it against
     */
    const parent = pagesById.get(page.parentId);
    if (!parent) continue;

    const roleIdsOnPage = new Set(
      page.roleAccess.map((access) => access.roleId),
    );
    if (roleIdsOnPage.size === 0) continue;

    const roleIds = resolvers
      .filter(
        ({ role, resolver }) =>
          roleIdsOnPage.has(role.id) && !resolver.get(parent.id)?.canRead,
      )
      .map(({ role }) => role.id);

    if (roleIds.length > 0) prunes.push({ pageId, roleIds });
  }

  return prunes;
};
