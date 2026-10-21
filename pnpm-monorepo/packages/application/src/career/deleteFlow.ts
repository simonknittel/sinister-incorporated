import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError, rethrowRecordNotFound } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { CareerErrorMessage } from "./careerErrors.js";
import type { FlowOutput } from "./createFlow.js";

export const deleteFlowInputSchema = z.object({
  flow_id: idSchema,
});

export type DeleteFlowInput = z.infer<typeof deleteFlowInputSchema>;

/**
 * Deletes a flow softly: it releases its slug, and nobody can read it until a
 * manager restores it. Requires `career;manage`.
 *
 * @throws NotFoundError when the flow does not exist or is deleted already
 */
export const deleteFlow = (
  context: ApplicationContext,
  actor: Actor,
  input: DeleteFlowInput,
): Promise<FlowOutput> =>
  withSpan(context, "deleteFlow", async () => {
    requirePermission(actor, "career", "manage");

    const flow = await context.prisma.flow.findUnique({
      where: { id: input.flow_id },
      select: { id: true, name: true, slug: true, deletedAt: true },
    });
    if (!flow || flow.deletedAt)
      throw new NotFoundError(CareerErrorMessage.FlowNotFound);

    const citizenId = actor.citizen?.id ?? null;

    /**
     * Soft delete only: the nodes, the edges and the role access stay in
     * place, thus a restore is possible. The condition on `deletedAt` lets
     * only one of two parallel requests delete the flow.
     */
    await rethrowRecordNotFound(
      () =>
        context.prisma.flow.update({
          where: { id: flow.id, deletedAt: null },
          data: {
            deletedAt: context.now(),
            deletedById: citizenId,
            updatedById: citizenId,
          },
          select: { id: true },
        }),
      CareerErrorMessage.FlowNotFound,
    );

    await context.audit.create([
      {
        type: AuditEventType.CAREER_FLOW_DELETED,
        data: { flowId: flow.id, name: flow.name, slug: flow.slug },
        createdById: actor.userId,
      },
    ]);

    return { id: flow.id, name: flow.name, slug: flow.slug };
  });
