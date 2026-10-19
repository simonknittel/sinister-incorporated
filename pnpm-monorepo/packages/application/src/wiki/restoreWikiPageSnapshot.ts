import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { normalizeWikiContent } from "./wikiContentNormalization.js";
import { WikiErrorMessage } from "./wikiErrors.js";
import { requireAdministrableWikiPage } from "./wikiPageAdminGuard.js";
import { replaceWikiPageContentWithSafetySnapshot } from "./wikiPageSafetySnapshot.js";

export const restoreWikiPageSnapshotInputSchema = z.object({
  snapshot_id: idSchema,
});

export type RestoreWikiPageSnapshotInput = z.output<
  typeof restoreWikiPageSnapshotInputSchema
>;

export interface RestoreWikiPageSnapshotOptions {
  /** The name of the safety snapshot in the snapshot list */
  readonly safetySnapshotName: string;
}

export interface RestoreWikiPageSnapshotOutput {
  readonly page_id: string;
  readonly snapshot_id: string;
}

/**
 * Makes a snapshot the current content of its page. Only for the
 * administrators of the page. A safety snapshot of the current content comes
 * first: it is the undo path. The content goes through the collab server,
 * thus the open editors get the restored content.
 *
 * @throws NotFoundError when the snapshot or its page does not exist, or the
 * page is in the trash: the retention of the automatic snapshots, a
 * permanent delete or a different tab removed it before
 * @throws ForbiddenError when the actor does not manage the page
 * @throws ValidationError when the current schema of the editor cannot hold
 * the snapshot
 * @throws ConflictError when the briefing is frozen, the collab server is
 * not configured or does not take the content. The safety snapshot stays.
 */
export const restoreWikiPageSnapshot = (
  context: ApplicationContext,
  actor: Actor,
  input: RestoreWikiPageSnapshotInput,
  options: RestoreWikiPageSnapshotOptions,
): Promise<RestoreWikiPageSnapshotOutput> =>
  withSpan(context, "restoreWikiPageSnapshot", async () => {
    const snapshot = await context.prisma.wikiPageSnapshot.findUnique({
      where: { id: input.snapshot_id },
      select: { id: true, pageId: true, content: true },
    });
    if (!snapshot) throw new NotFoundError(WikiErrorMessage.SnapshotNotFound);

    const { page } = await requireAdministrableWikiPage(
      context,
      actor,
      snapshot.pageId,
    );

    /** A snapshot can be older than a change of the schema of the editor */
    let content: object;
    try {
      content = normalizeWikiContent(snapshot.content);
    } catch (error) {
      throw new ValidationError(WikiErrorMessage.SnapshotIncompatible, {
        cause: error,
      });
    }

    await replaceWikiPageContentWithSafetySnapshot(context, {
      pageId: page.id,
      content,
      updatedByEntityId: actor.citizen?.id ?? null,
      safetySnapshotName: options.safetySnapshotName,
      failureMessage: WikiErrorMessage.SnapshotRestoreFailed,
    });

    await context.audit.create([
      {
        type: AuditEventType.WIKI_PAGE_SNAPSHOT_RESTORED,
        data: {
          pageId: page.id,
          eventId: page.eventId ?? undefined,
          snapshotId: snapshot.id,
        },
        createdById: actor.userId,
      },
    ]);

    return { page_id: page.id, snapshot_id: snapshot.id };
  });
