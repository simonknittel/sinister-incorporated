import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { noteClassificationNameSchema } from "./noteClassificationName.js";

export const createClassificationLevelInputSchema = z.object({
  name: noteClassificationNameSchema,
});

export type CreateClassificationLevelInput = z.infer<
  typeof createClassificationLevelInputSchema
>;

export interface CreateClassificationLevelOutput {
  readonly id: string;
  readonly name: string;
}

/** Creates a classification level. Requires `classificationLevel;manage`. */
export const createClassificationLevel = async (
  context: ApplicationContext,
  actor: Actor,
  input: CreateClassificationLevelInput,
): Promise<CreateClassificationLevelOutput> => {
  requirePermission(actor, "classificationLevel", "manage");

  const classificationLevel = await context.prisma.classificationLevel.create({
    data: { name: input.name },
    select: { id: true, name: true },
  });

  await context.audit.create([
    {
      type: AuditEventType.CLASSIFICATION_LEVEL_CREATED,
      data: {
        classificationLevelId: classificationLevel.id,
        name: classificationLevel.name,
      },
      createdById: actor.userId,
    },
  ]);

  return classificationLevel;
};
