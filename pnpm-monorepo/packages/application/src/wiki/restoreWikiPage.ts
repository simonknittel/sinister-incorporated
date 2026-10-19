import {
  AuditEventType,
  collectWikiPageDescendants,
} from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import type { WikiSharedContextPage } from "./wikiContext.js";
import { requireAdministrableWikiPage } from "./wikiPageAdminGuard.js";

export const restoreWikiPageInputSchema = z.object({
  page_id: idSchema,
});

export type RestoreWikiPageInput = z.infer<typeof restoreWikiPageInputSchema>;

export interface RestoreWikiPageOutput {
  readonly page_id: string;
  /** The page, its ancestors in the trash and its descendants */
  readonly restored_page_ids: string[];
}

/**
 * The ancestors of the page that are in the trash: a page cannot be live
 * below a parent in the trash
 */
const collectDeletedAncestorIds = (
  pagesById: ReadonlyMap<string, WikiSharedContextPage>,
  page: WikiSharedContextPage,
) => {
  const deletedAncestorIds: string[] = [];
  const visited = new Set<string>([page.id]);
  let current = page.parentId ? pagesById.get(page.parentId) : undefined;
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    if (current.deletedAt) deletedAncestorIds.push(current.id);
    current = current.parentId ? pagesById.get(current.parentId) : undefined;
  }

  return deletedAncestorIds;
};

/**
 * Takes the page out of the trash together with its subtree and its
 * ancestors in the trash. Trade-off: the management of the page is enough to
 * restore its ancestors, thus the manager of a child page can undo the
 * deletion of a parent page by its manager. The tree needs it.
 *
 * @throws NotFoundError when the page does not exist for the actor or is
 * not in the trash
 * @throws ForbiddenError when the actor does not manage the page
 * @throws ConflictError when the event of the briefing is over
 */
export const restoreWikiPage = (
  context: ApplicationContext,
  actor: Actor,
  input: RestoreWikiPageInput,
): Promise<RestoreWikiPageOutput> =>
  withSpan(context, "restoreWikiPage", async () => {
    const { scope, page } = await requireAdministrableWikiPage(
      context,
      actor,
      input.page_id,
      { expectDeleted: true },
    );

    const restoredIds = [
      page.id,
      ...collectDeletedAncestorIds(scope.pagesById, page),
      ...collectWikiPageDescendants(scope.allPages, page.id),
    ];

    await context.prisma.wikiPage.updateMany({
      where: { id: { in: restoredIds }, deletedAt: { not: null } },
      data: { deletedAt: null, deletedById: null },
    });

    await context.audit.create([
      {
        type: AuditEventType.WIKI_PAGE_RESTORED,
        data: {
          pageId: page.id,
          eventId: page.eventId ?? undefined,
          title: page.title,
          restoredPageIds: restoredIds,
        },
        createdById: actor.userId,
      },
    ]);

    return { page_id: page.id, restored_page_ids: restoredIds };
  });
