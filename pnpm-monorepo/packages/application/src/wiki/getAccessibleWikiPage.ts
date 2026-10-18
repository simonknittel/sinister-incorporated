import type { WikiPageTierPermissions } from "@sam-monorepo/domain";

/** The permission tiers of a wiki page */
export enum WikiPageAccessTier {
  Read = "read",
  Edit = "edit",
  Admin = "admin",
}

interface AccessiblePage {
  readonly id: string;
  readonly deletedAt: Date | null;
}

/**
 * Generic over the page type so the global and the event wiki context both
 * get their own page shape back.
 */
interface AccessibleWikiPageContext<TPage extends AccessiblePage> {
  readonly pagesById: ReadonlyMap<string, TPage>;
  readonly permissions: ReadonlyMap<string, WikiPageTierPermissions>;
}

const hasTier = (
  permissions: WikiPageTierPermissions | undefined,
  tier: WikiPageAccessTier,
) => {
  switch (tier) {
    case WikiPageAccessTier.Read:
      return permissions?.canRead;

    case WikiPageAccessTier.Edit:
      return permissions?.canEdit;

    case WikiPageAccessTier.Admin:
      return permissions?.canAdmin;

    default:
      throw new Error(`Unknown wiki page access tier: ${tier satisfies never}`);
  }
};

/**
 * The page if it exists, is not trashed and the viewer holds the tier —
 * NULL otherwise, without distinguishing why: an unknown, trashed and
 * invisible page all look the same, so existence never leaks. Callers
 * needing separate missing-vs-forbidden responses keep their explicit
 * checks instead.
 */
export const getAccessibleWikiPage = <TPage extends AccessiblePage>(
  context: AccessibleWikiPageContext<TPage>,
  pageId: string | null | undefined,
  tier: WikiPageAccessTier,
): TPage | null => {
  if (!pageId) return null;
  const page = context.pagesById.get(pageId);
  if (!page || page.deletedAt) return null;

  return hasTier(context.permissions.get(page.id), tier) ? page : null;
};
