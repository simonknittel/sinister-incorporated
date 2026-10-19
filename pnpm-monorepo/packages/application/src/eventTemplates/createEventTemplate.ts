import {
  AuditEventType,
  buildBriefingRootPageSeed,
} from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { requireOwnCoverImage } from "../events/coverImage.js";
import { requireDescriptionFitsDiscord } from "../events/eventDescription.js";
import {
  eventDescriptionSchema,
  eventNameSchema,
} from "../events/eventInputSchemas.js";
import { withSpan } from "../withSpan.js";

/** A template has the bounds of an event, so a prefill never exceeds them */
export const createEventTemplateInputSchema = z.object({
  name: eventNameSchema,
  description: eventDescriptionSchema.optional(),
});

export type CreateEventTemplateInput = z.infer<
  typeof createEventTemplateInputSchema
>;

/** The parts of a new template that only the app gives: the uploads */
export interface CreateEventTemplateOptions {
  /** An image that the actor uploaded. The use case checks it. */
  readonly coverImageId?: string;
}

export interface CreateEventTemplateOutput {
  readonly id: string;
  readonly name: string;
}

/**
 * Creates a personal template of the actor. Everyone who may create events
 * may keep personal templates; sharing them takes the extra permission.
 */
export const createEventTemplate = (
  context: ApplicationContext,
  actor: Actor,
  input: CreateEventTemplateInput,
  { coverImageId }: CreateEventTemplateOptions = {},
): Promise<CreateEventTemplateOutput> =>
  withSpan(context, "createEventTemplate", async () => {
    requirePermission(actor, "event", "create");
    const citizenId = requireCitizen(actor).id;

    requireDescriptionFitsDiscord(context, input.description);

    if (coverImageId)
      await requireOwnCoverImage(context, citizenId, coverImageId);

    /**
     * Create the template with the same manager-scoped briefing root page an
     * event gets, so the blueprint starts out like the thing it describes.
     */
    const template = await context.prisma.eventTemplate.create({
      data: {
        name: input.name,
        description: input.description || null,
        coverImageId: coverImageId ?? null,
        createdById: citizenId,
        updatedById: citizenId,
        ownedById: citizenId,
        wikiPages: {
          create: buildBriefingRootPageSeed(citizenId),
        },
      },
      select: { id: true, name: true },
    });

    await context.audit.create([
      {
        type: AuditEventType.EVENT_TEMPLATE_CREATED,
        data: { templateId: template.id, name: template.name },
        createdById: actor.userId,
      },
    ]);

    return template;
  });
