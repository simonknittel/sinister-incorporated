import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { rethrowRecordNotFound } from "../errors.js";
import { idSchema } from "../pagination.js";
import { deletePermissionStringsReferencing } from "../roles/deletePermissionStringsReferencing.js";
import { NoteClassificationErrorMessage } from "./noteClassificationErrors.js";

export const deleteClassificationLevelInputSchema = z.object({
  classification_level_id: idSchema,
});

export type DeleteClassificationLevelInput = z.infer<
  typeof deleteClassificationLevelInputSchema
>;

/** The classification level before the delete */
export interface DeleteClassificationLevelOutput {
  readonly id: string;
  readonly name: string;
}

/**
 * Deletes a classification level, and the permission strings that refer to it. Requires
 * `classificationLevel;manage`.
 *
 * @throws NotFoundError when the classification level does not exist
 */
export const deleteClassificationLevel = async (
  context: ApplicationContext,
  actor: Actor,
  input: DeleteClassificationLevelInput,
): Promise<DeleteClassificationLevelOutput> => {
  requirePermission(actor, "classificationLevel", "manage");

  /**
   * The delete fails with a missing record when a different user or tab
   * deleted the classification level before.
   */
  const [classificationLevel] = await rethrowRecordNotFound(
    () =>
      context.prisma.$transaction([
        context.prisma.classificationLevel.delete({
          where: { id: input.classification_level_id },
          select: { id: true, name: true },
        }),
        deletePermissionStringsReferencing(
          context.prisma,
          "classificationLevelId",
          input.classification_level_id,
        ),
      ]),
    NoteClassificationErrorMessage.ClassificationLevelNotFound,
  );

  await context.audit.create([
    {
      type: AuditEventType.CLASSIFICATION_LEVEL_DELETED,
      data: {
        classificationLevelId: classificationLevel.id,
        name: classificationLevel.name,
      },
      createdById: actor.userId,
    },
  ]);

  return classificationLevel;
};
