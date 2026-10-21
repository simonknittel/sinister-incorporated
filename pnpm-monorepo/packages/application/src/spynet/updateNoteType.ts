import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError, rethrowRecordNotFound } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { NoteClassificationErrorMessage } from "./noteClassificationErrors.js";
import { noteClassificationNameSchema } from "./noteClassificationName.js";

export const updateNoteTypeInputSchema = z.object({
  note_type_id: idSchema,
  name: noteClassificationNameSchema,
});

export type UpdateNoteTypeInput = z.infer<typeof updateNoteTypeInputSchema>;

export interface UpdateNoteTypeOutput {
  readonly id: string;
  readonly name: string;
}

/**
 * Renames a note type. Requires `noteType;manage`.
 *
 * @throws NotFoundError when the note type does not exist
 */
export const updateNoteType = (
  context: ApplicationContext,
  actor: Actor,
  input: UpdateNoteTypeInput,
): Promise<UpdateNoteTypeOutput> =>
  withSpan(context, "updateNoteType", async () => {
    requirePermission(actor, "noteType", "manage");

    const existingNoteType = await context.prisma.noteType.findUnique({
      where: { id: input.note_type_id },
      select: { name: true },
    });
    if (!existingNoteType)
      throw new NotFoundError(NoteClassificationErrorMessage.NoteTypeNotFound);

    const noteType = await rethrowRecordNotFound(
      () =>
        context.prisma.noteType.update({
          where: { id: input.note_type_id },
          data: { name: input.name },
          select: { id: true, name: true },
        }),
      NoteClassificationErrorMessage.NoteTypeNotFound,
    );

    await context.audit.create([
      {
        type: AuditEventType.NOTE_TYPE_UPDATED,
        data: {
          noteTypeId: noteType.id,
          previousName: existingNoteType.name,
          newName: noteType.name,
        },
        createdById: actor.userId,
      },
    ]);

    return noteType;
  });
