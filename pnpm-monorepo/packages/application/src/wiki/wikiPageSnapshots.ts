import type {
  Citizen,
  WikiPageSnapshotKind,
} from "@sam-monorepo/database/client";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { WikiPageAccessTier } from "./getAccessibleWikiPage.js";
import type { WikiSharedContextPage } from "./wikiContext.js";
import { WikiErrorMessage } from "./wikiErrors.js";
import { loadWikiScopeOfPage, requireAccessibleWikiPage } from "./wikiScope.js";

/** A row of the snapshot list of a page */
export interface WikiPageSnapshotRow {
  readonly id: string;
  readonly kind: WikiPageSnapshotKind;
  /** Null for an automatic snapshot */
  readonly name: string | null;
  readonly createdAt: Date;
  readonly createdBy: Pick<Citizen, "id" | "handle" | "deletedAt"> | null;
}

/**
 * The snapshots of a page, the newest first: the automatic snapshots of the
 * editor and the safety snapshots before a restore, an import or a paste
 * that replaces the page. Only for the administrators of the page.
 *
 * @throws NotFoundError when the page does not exist, is in the trash or
 * the actor cannot administrate it
 */
export const findWikiPageSnapshotRows = async (
  context: ApplicationContext,
  actor: Actor,
  { pageId }: { readonly pageId: string },
): Promise<WikiPageSnapshotRow[]> => {
  const scope = await loadWikiScopeOfPage(context, actor, pageId);
  if (!scope) throw new NotFoundError(WikiErrorMessage.PageNotFound);
  requireAccessibleWikiPage<WikiSharedContextPage>(
    scope,
    pageId,
    WikiPageAccessTier.Admin,
  );

  const snapshots = await context.prisma.wikiPageSnapshot.findMany({
    where: { pageId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      kind: true,
      name: true,
      createdAt: true,
      createdBy: { select: { id: true, handle: true, deletedAt: true } },
    },
  });

  return snapshots.map((snapshot) => ({
    id: snapshot.id,
    kind: snapshot.kind,
    name: snapshot.name,
    createdAt: snapshot.createdAt,
    createdBy: snapshot.createdBy && {
      id: snapshot.createdBy.id,
      handle: snapshot.createdBy.handle,
      deletedAt: snapshot.createdBy.deletedAt,
    },
  }));
};
