import { AuditEventType, ReadMarkerSubject } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { findNewItemIds } from "./findNewItemIds.js";
import { ReadMarkerErrorMessage } from "./readMarkerErrors.js";
import { READ_MARKER_SUBJECT_RULES } from "./readMarkerSubjects.js";

export const markItemAsReadInputSchema = z.object({
  subject: z.enum(ReadMarkerSubject),
  subject_id: idSchema,
});

export type MarkItemAsReadInput = z.output<typeof markItemAsReadInputSchema>;

export interface MarkItemAsReadOutput {
  readonly subject: ReadMarkerSubject;
  readonly subject_id: string;
  /**
   * Whether the item was new for the actor before this call. A marker that a
   * different tab wrote between the read and the write does not change it.
   */
  readonly was_new: boolean;
  /** False when the actor had a marker for the item already */
  readonly created: boolean;
}

/**
 * Marks one item as read by the actor: from its details once they mounted in
 * the browser, or from a click on its "Neu" marker. Repeated calls change
 * nothing.
 *
 * @throws ForbiddenError for a user without a citizen, or without the
 * permission to read the items of the subject type
 * @throws NotFoundError when the item does not exist or the actor cannot see
 * it: a different user can have deleted the item or taken the read access
 * away after the page showed it
 */
export const markItemAsRead = (
  context: ApplicationContext,
  actor: Actor,
  input: MarkItemAsReadInput,
): Promise<MarkItemAsReadOutput> =>
  withSpan(context, "markItemAsRead", async () => {
    const citizenId = requireCitizen(actor).id;

    const rule = READ_MARKER_SUBJECT_RULES[input.subject];
    requirePermission(actor, rule.readResource, "read");

    if (!(await rule.canRead(context, actor, input.subject_id)))
      throw new NotFoundError(ReadMarkerErrorMessage.ItemNotFound);

    /**
     * Read before the write: after the write the item is never new. A marker
     * that a different tab wrote before this read gives `false`.
     */
    const wasNew =
      (
        await findNewItemIds(context, actor, {
          subject: input.subject,
          subjectIds: [input.subject_id],
        })
      ).length > 0;

    const { count } = await context.prisma.readMarker.createMany({
      data: [
        {
          citizenId,
          readAt: context.now(),
          ...rule.markerData(input.subject_id),
        },
      ],
      skipDuplicates: true,
    });

    if (count > 0)
      await context.audit.create([
        {
          type: AuditEventType.READ_MARKER_CREATED,
          data: {
            citizenId,
            subject: input.subject,
            subjectId: input.subject_id,
          },
          createdById: actor.userId,
        },
      ]);

    return {
      subject: input.subject,
      subject_id: input.subject_id,
      was_new: wasNew,
      created: count > 0,
    };
  });
