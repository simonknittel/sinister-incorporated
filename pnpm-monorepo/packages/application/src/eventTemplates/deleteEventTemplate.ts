import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { requireManageableEventTemplate } from "./eventTemplateGuards.js";

export const deleteEventTemplateInputSchema = z.object({
  template_id: idSchema,
});

export type DeleteEventTemplateInput = z.infer<
  typeof deleteEventTemplateInputSchema
>;

export interface DeleteEventTemplateOutput {
  readonly template_id: string;
}

/**
 * Soft-deletes a template: it disappears from every list and from the
 * create-event picker, and grants nothing to the roles it was shared with —
 * only its owner and `event;manage` holders can still find and restore it
 * through the status filter.
 */
export const deleteEventTemplate = (
  context: ApplicationContext,
  actor: Actor,
  input: DeleteEventTemplateInput,
): Promise<DeleteEventTemplateOutput> =>
  withSpan(context, "deleteEventTemplate", async () => {
    const { template } = await requireManageableEventTemplate(
      context,
      actor,
      input.template_id,
      { select: { name: true } },
    );

    /**
     * The condition on `deletedAt` lets only one of two parallel requests
     * delete the template. A template that a different tab or user deleted
     * before is no error: the result is the same.
     */
    const { count } = await context.prisma.eventTemplate.updateMany({
      where: { id: template.id, deletedAt: null },
      data: {
        deletedAt: context.now(),
        deletedById: actor.citizen?.id ?? null,
      },
    });

    if (count > 0)
      await context.audit.create([
        {
          type: AuditEventType.EVENT_TEMPLATE_DELETED,
          data: { templateId: template.id, name: template.name },
          createdById: actor.userId,
        },
      ]);

    return { template_id: template.id };
  });
