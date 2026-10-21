import type { WikiPageSnapshotKind } from "@sam-monorepo/database/client";
import { CITIZEN_REFERENCE_SELECT } from "../citizenReference.js";
import type { ApplicationContext } from "../context.js";
import { WikiPageAccessTier } from "./getAccessibleWikiPage.js";
import { type WikiCitizen } from "./wikiCitizen.js";
import { requireAccessibleWikiPage, type WikiScope } from "./wikiScope.js";

/** A row of the snapshot list of a page */
export interface WikiPageSnapshotRow {
  readonly id: string;
  readonly kind: WikiPageSnapshotKind;
  /** Null for an automatic snapshot */
  readonly name: string | null;
  readonly createdAt: Date;
  readonly createdBy: WikiCitizen | null;
}

/**
 * The snapshots of a page, the newest first: the automatic snapshots of the
 * editor and the safety snapshots before a restore, an import or a paste
 * that replaces the page. Only for the administrators of the page. A scope
 * helper: the scope comes from a scope builder of this package for the same
 * actor.
 *
 * @throws NotFoundError when the page is not in the scope, is in the trash
 * or the actor cannot administrate it
 */
export const findWikiPageSnapshotRows = (
  context: Pick<ApplicationContext, "prisma">,
  scope: WikiScope,
  pageId: string,
): Promise<WikiPageSnapshotRow[]> => {
  requireAccessibleWikiPage(scope, pageId, WikiPageAccessTier.Admin);

  return context.prisma.wikiPageSnapshot.findMany({
    where: { pageId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      kind: true,
      name: true,
      createdAt: true,
      createdBy: { select: CITIZEN_REFERENCE_SELECT },
    },
  });
};
