import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { rethrowRecordNotFound } from "../errors.js";
import { idSchema } from "../pagination.js";
import { deletePermissionStringsReferencing } from "../roles/deletePermissionStringsReferencing.js";
import { NoteClassificationErrorMessage } from "./noteClassificationErrors.js";

export const deleteNoteTypeInputSchema = z.object({
  note_type_id: idSchema,
});

export type DeleteNoteTypeInput = z.infer<typeof deleteNoteTypeInputSchema>;

/** The note type before the delete */
export interface DeleteNoteTypeOutput {
  readonly id: string;
  readonly name: string;
}

/**
 * Deletes a note type, and the permission strings that refer to it. Requires
 * `noteType;manage`.
 *
 * @throws NotFoundError when the note type does not exist
 */
export const deleteNoteType = async (
  context: ApplicationContext,
  actor: Actor,
  input: DeleteNoteTypeInput,
): Promise<DeleteNoteTypeOutput> => {
  requirePermission(actor, "noteType", "manage");

  /**
   * The delete fails with a missing record when a different user or tab
   * deleted the note type before.
   */
  const [noteType] = await rethrowRecordNotFound(
    () =>
      context.prisma.$transaction([
        context.prisma.noteType.delete({
          where: { id: input.note_type_id },
          select: { id: true, name: true },
        }),
        deletePermissionStringsReferencing(
          context.prisma,
          "noteTypeId",
          input.note_type_id,
        ),
      ]),
    NoteClassificationErrorMessage.NoteTypeNotFound,
  );

  await context.audit.create([
    {
      type: AuditEventType.NOTE_TYPE_DELETED,
      data: { noteTypeId: noteType.id, name: noteType.name },
      createdById: actor.userId,
    },
  ]);

  return noteType;
};
