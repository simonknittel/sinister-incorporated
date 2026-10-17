/**
 * Sibling sort order used by the sidebar tree, the hierarchy selects and the
 * reorder action. All of them must agree: the drag'n'drop action inserts a
 * page relative to its reference sibling within the list produced by this
 * comparator, so a diverging copy would place it somewhere other than the
 * drop position shown in the sidebar.
 */
export const compareWikiPagesByOrder = (
  a: { readonly sortOrder: number; readonly title: string },
  b: { readonly sortOrder: number; readonly title: string },
) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title);

interface WikiTreePageInput {
  readonly id: string;
  readonly parentId: string | null;
  readonly title: string;
  readonly slug: string;
  readonly iconId: string | null;
  readonly sortOrder: number;
}

/** The access tiers of the viewer for one page */
interface WikiTreePagePermissions {
  readonly canRead: boolean;
  readonly canEdit: boolean;
  readonly canAdmin: boolean;
}

export interface WikiTreeNode {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly iconId: string | null;
  readonly sortOrder: number;
  /** Whether the viewer may edit the page (e.g. create subpages) */
  readonly canEdit: boolean;
  /** Whether the viewer may administrate the page (e.g. reorder it) */
  readonly canAdmin: boolean;
  readonly children: WikiTreeNode[];
}

/**
 * Builds the tree shown in the wiki sidebar: the pages the viewer can read,
 * in their real hierarchy. Readable pages always have readable ancestors — a
 * page grants nothing to someone who cannot read the page above it — so only
 * pages whose parent is missing from the list (e.g. deleted) hang at the top
 * level instead.
 */
export const buildVisibleWikiTree = (
  pages: readonly WikiTreePageInput[],
  permissions: ReadonlyMap<string, WikiTreePagePermissions>,
): WikiTreeNode[] => {
  const pagesById = new Map(pages.map((page) => [page.id, page]));
  const canRead = (id: string) => permissions.get(id)?.canRead === true;

  const childrenByParent = Map.groupBy(
    pages.filter((page) => canRead(page.id)),
    (page) =>
      page.parentId && pagesById.has(page.parentId) ? page.parentId : null,
  );

  const toNodes = (
    parentId: string | null,
    visited: Set<string>,
  ): WikiTreeNode[] => {
    const children = childrenByParent.get(parentId) ?? [];
    return children
      .filter((child) => !visited.has(child.id))
      .toSorted(compareWikiPagesByOrder)
      .map((child) => ({
        id: child.id,
        title: child.title,
        slug: child.slug,
        iconId: child.iconId,
        sortOrder: child.sortOrder,
        canEdit: permissions.get(child.id)?.canEdit === true,
        canAdmin: permissions.get(child.id)?.canAdmin === true,
        children: toNodes(child.id, new Set([...visited, child.id])),
      }));
  };

  return toNodes(null, new Set());
};

/**
 * The part of a wiki scope that decides the URL of a page: the route prefix
 * of the pages, and the page that the scope serves at its home
 */
export interface WikiPageHrefBase {
  /** Route prefix all page URLs live under */
  readonly basePath: string;
  /** Page served at the home of the scope, or null */
  readonly rootPageId: string | null;
  /** Where the root page serves when that differs from the basePath */
  readonly rootHref: string | null;
}

/** The app route of a page, relative to the base URL of the app */
export const buildWikiPageHref = (
  mode: WikiPageHrefBase,
  page: { readonly id: string; readonly slug: string },
) =>
  page.id === mode.rootPageId
    ? (mode.rootHref ?? mode.basePath)
    : `${mode.basePath}/${page.id}/${page.slug}`;
