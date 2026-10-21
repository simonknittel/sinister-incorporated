import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  NotFoundError,
  rethrowRecordNotFound,
  rethrowUniqueConstraintFailed,
} from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { CareerErrorMessage } from "./careerErrors.js";
import { createFlowInputSchema, type FlowOutput } from "./createFlow.js";
import { requireUsableFlowSlug } from "./flowSlugs.js";

export const renameFlowInputSchema = z.object({
  flow_id: idSchema,
  name: createFlowInputSchema.shape.name,
  slug: createFlowInputSchema.shape.slug,
});

export type RenameFlowInput = z.infer<typeof renameFlowInputSchema>;

/**
 * Gives a live flow a new name and a new slug. The links to the old slug
 * stop to work. Requires `career;manage`.
 *
 * @throws NotFoundError when the flow does not exist or is deleted
 * @throws ValidationError when the flow cannot use the slug
 */
export const renameFlow = (
  context: ApplicationContext,
  actor: Actor,
  input: RenameFlowInput,
): Promise<FlowOutput> =>
  withSpan(context, "renameFlow", async () => {
    requirePermission(actor, "career", "manage");

    const flow = await context.prisma.flow.findUnique({
      where: { id: input.flow_id },
      select: { id: true, name: true, slug: true, deletedAt: true },
    });
    if (!flow || flow.deletedAt)
      throw new NotFoundError(CareerErrorMessage.FlowNotFound);

    await requireUsableFlowSlug(context.prisma, input.slug, {
      exceptFlowId: flow.id,
    });

    /**
     * The condition on `deletedAt` keeps a different request from deleting
     * the flow between the check and the write unnoticed
     */
    const renamedFlow = await rethrowRecordNotFound(
      () =>
        rethrowUniqueConstraintFailed(
          () =>
            context.prisma.flow.update({
              where: { id: flow.id, deletedAt: null },
              data: {
                name: input.name,
                slug: input.slug,
                updatedById: actor.citizen?.id ?? null,
              },
              select: { id: true, name: true, slug: true },
            }),
          CareerErrorMessage.SlugTaken,
        ),
      CareerErrorMessage.FlowNotFound,
    );

    await context.audit.create([
      {
        type: AuditEventType.CAREER_FLOW_RENAMED,
        data: {
          flowId: flow.id,
          previousName: flow.name,
          name: input.name,
          previousSlug: flow.slug,
          slug: input.slug,
        },
        createdById: actor.userId,
      },
    ]);

    return renamedFlow;
  });
