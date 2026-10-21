import {
  AuditEventType,
  FLOW_NAME_MAX_LENGTH,
  SLUG_MAX_LENGTH,
} from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { rethrowUniqueConstraintFailed } from "../errors.js";
import { withSpan } from "../withSpan.js";
import { CareerErrorMessage } from "./careerErrors.js";
import { getNextFlowPosition, requireUsableFlowSlug } from "./flowSlugs.js";

export const createFlowInputSchema = z.object({
  name: z.string().trim().min(1).max(FLOW_NAME_MAX_LENGTH),
  slug: z.string().trim().min(1).max(SLUG_MAX_LENGTH),
});

export type CreateFlowInput = z.infer<typeof createFlowInputSchema>;

/** A flow after a write */
export interface FlowOutput {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}

/**
 * Creates an empty flow at the end of the list. Only the managers can read
 * it, until a manager gives roles access. Requires `career;manage`.
 *
 * @throws ValidationError when the flow cannot use the slug
 */
export const createFlow = (
  context: ApplicationContext,
  actor: Actor,
  input: CreateFlowInput,
): Promise<FlowOutput> =>
  withSpan(context, "createFlow", async () => {
    requirePermission(actor, "career", "manage");

    await requireUsableFlowSlug(context.prisma, input.slug);

    const position = await getNextFlowPosition(context.prisma);
    const citizenId = actor.citizen?.id ?? null;

    /**
     * Two managers can create the same slug at the same time: the unique
     * index decides
     */
    const flow = await rethrowUniqueConstraintFailed(
      () =>
        context.prisma.flow.create({
          data: {
            name: input.name,
            slug: input.slug,
            position,
            createdById: citizenId,
            updatedById: citizenId,
          },
          select: { id: true, name: true, slug: true },
        }),
      CareerErrorMessage.SlugTaken,
    );

    await context.audit.create([
      {
        type: AuditEventType.CAREER_FLOW_CREATED,
        data: { flowId: flow.id, name: input.name, slug: input.slug },
        createdById: actor.userId,
      },
    ]);

    return flow;
  });
