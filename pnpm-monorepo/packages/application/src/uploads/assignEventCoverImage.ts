import { EventSource } from "@sam-monorepo/database/client";
import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  ForbiddenError,
  NotFoundError,
  rethrowRecordNotFound,
} from "../errors.js";
import {
  syncEventDiscordPublication,
  type DiscordSyncResult,
} from "../events/eventDiscordPublication.js";
import { EVENT_MANAGE_GUARD_SELECT } from "../events/eventManageGuard.js";
import {
  isAllowedToManageEvent,
  isEventUpdatable,
} from "../events/eventManageRules.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import {
  findAssignableUpload,
  requireOwnImageUpload,
} from "./assignableUpload.js";
import { UploadErrorMessage } from "./uploadErrors.js";

export const assignEventCoverImageInputSchema = z.object({
  event_id: idSchema,
  /** Null removes the cover image */
  upload_id: idSchema.nullable(),
});

export type AssignEventCoverImageInput = z.infer<
  typeof assignEventCoverImageInputSchema
>;

export interface AssignEventCoverImageOutput {
  readonly event_id: string;
  /** The image whose dimensions the host probes after the response */
  readonly probe_upload_id: string | null;
  /**
   * The sync of a published event. The cover image is saved before the
   * sync, thus a Discord problem is only a warning for the actor.
   */
  readonly discord: DiscordSyncResult;
}

/**
 * Sets or removes the cover image of an app event. Only app events have a
 * cover. The change needs the manage rule of the other event settings, and
 * it is not possible after the end of the event. The cover must be an image
 * of the citizen of the actor. The nightly cleanup deletes the upload of a
 * replaced or removed cover. A published event gets the cover on Discord
 * too.
 *
 * @throws ForbiddenError when the user has no citizen, when the actor cannot
 * manage the event, when the event is over, or when the upload belongs to a
 * different citizen
 * @throws NotFoundError when the event or the upload does not exist
 * @throws ValidationError when the upload is not an image
 */
export const assignEventCoverImage = (
  context: ApplicationContext,
  actor: Actor,
  input: AssignEventCoverImageInput,
): Promise<AssignEventCoverImageOutput> =>
  withSpan(context, "assignEventCoverImage", async () => {
    const citizen = requireCitizen(actor);

    const [event, upload] = await Promise.all([
      context.prisma.event.findUnique({
        where: { id: input.event_id, source: EventSource.APP, deletedAt: null },
        select: EVENT_MANAGE_GUARD_SELECT,
      }),
      findAssignableUpload(context, input.upload_id),
    ]);
    if (!event) throw new NotFoundError(UploadErrorMessage.TargetNotFound);
    if (input.upload_id !== null && !upload)
      throw new NotFoundError(UploadErrorMessage.UploadNotFound);

    if (
      !isEventUpdatable(event, context.now()) ||
      !isAllowedToManageEvent(actor, event)
    )
      throw new ForbiddenError(UploadErrorMessage.TargetNotEditable);
    if (upload) requireOwnImageUpload(upload, citizen);

    await rethrowRecordNotFound(
      () =>
        context.prisma.event.update({
          where: { id: event.id },
          data: { coverImageId: input.upload_id },
          select: { id: true },
        }),
      UploadErrorMessage.TargetNotFound,
    );

    await context.audit.create([
      {
        type: AuditEventType.EVENT_UPDATED_IN_APP,
        data: { eventId: event.id, changedFields: ["coverImage"] },
        createdById: actor.userId,
      },
    ]);

    const discord = await syncEventDiscordPublication(context, event.id);

    return {
      event_id: event.id,
      probe_upload_id: input.upload_id,
      discord,
    };
  });
