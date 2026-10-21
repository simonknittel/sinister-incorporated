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
import { getNextFlowPosition, requireUsableFlowSlug } from "./flowSlugs.js";

export const restoreFlowInputSchema = z.object({
  flow_id: idSchema,
  slug: createFlowInputSchema.shape.slug,
});

export type RestoreFlowInput = z.infer<typeof restoreFlowInputSchema>;

/**
 * Restores a deleted flow with its nodes and its role access at the end of
 * the list. Requires `career;manage`.
 *
 * @throws NotFoundError when the flow does not exist or is not deleted
 * @throws ValidationError when the flow cannot use the slug
 */
export const restoreFlow = (
  context: ApplicationContext,
  actor: Actor,
  input: RestoreFlowInput,
): Promise<FlowOutput> =>
  withSpan(context, "restoreFlow", async () => {
    requirePermission(actor, "career", "manage");

    const flow = await context.prisma.flow.findUnique({
      where: { id: input.flow_id },
      select: { id: true, name: true, deletedAt: true },
    });
    /** A different user restored the flow before */
    if (!flow?.deletedAt)
      throw new NotFoundError(CareerErrorMessage.FlowNotFound);

    /**
     * A deleted flow releases its slug, thus a different flow can use it now.
     * The manager selects a free slug in the restore dialog.
     */
    await requireUsableFlowSlug(context.prisma, input.slug);

    const position = await getNextFlowPosition(context.prisma);

    /**
     * The condition on `deletedAt` lets only one of two parallel requests
     * restore the flow
     */
    const restoredFlow = await rethrowRecordNotFound(
      () =>
        rethrowUniqueConstraintFailed(
          () =>
            context.prisma.flow.update({
              where: { id: flow.id, deletedAt: { not: null } },
              data: {
                deletedAt: null,
                deletedById: null,
                slug: input.slug,
                /** At the end of the list, not at a position that moved on */
                position,
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
        type: AuditEventType.CAREER_FLOW_RESTORED,
        data: { flowId: flow.id, name: flow.name, slug: input.slug },
        createdById: actor.userId,
      },
    ]);

    return restoredFlow;
  });
