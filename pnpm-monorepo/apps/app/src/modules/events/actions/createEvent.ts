"use server";

import { prisma } from "@/db";
import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { rejectConflict } from "@/modules/actions/utils/rejectConflict";
import { getApplicationContext, toActor } from "@/modules/application";
import { probeUploadImageDimensions } from "@/modules/common/utils/probeUploadImageDimensions";
import { getEventTemplateById } from "@/modules/event-templates/queries/getEventTemplateById";
import {
  COPYABLE_UPLOAD_SELECT,
  copyUpload,
} from "@/modules/uploads/utils/copyUpload";
import { getEventWikiContext } from "@/modules/wiki/queries/getEventWikiContext";
import { copyBriefingTree } from "@/modules/wiki/utils/copyBriefingTree";
import {
  createEventInputSchema,
  createEvent as createEventUseCase,
  type EventTemplateApplication,
} from "@sam-monorepo/application";
import { WikiPageEventScope } from "@sam-monorepo/database/client";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import {
  CLONABLE_POSITION_SELECT,
  clonePositions,
} from "../utils/clonePositions";
import { findDescriptionProblem } from "../utils/discordEventDescription";
import {
  discordPublishFieldsSchema,
  parseDiscordPublishFields,
} from "../utils/discordPublishFields";
import {
  createDiscordEventPublication,
  DiscordSyncOutcome,
  resolveDiscordPublishTarget,
} from "../utils/discordPublishing";
import { mapEventErrorToActionResponse } from "../utils/eventActionErrors";
import {
  DISCORD_PUBLISH_FAILED_PARAM,
  getEventPath,
  NOTIFICATIONS_FAILED_PARAM,
} from "../utils/eventConstraints";
import {
  eventContainerColumns,
  toEventContainer,
  toTemplateContainer,
} from "../utils/eventContainer";
import { parseEventDetailsFormData } from "../utils/eventFormData";
import { buildPositionTree } from "../utils/positionTree";

/**
 * The use case takes the details. The cover image, the template and the
 * Discord publication are only in the app.
 */
const schema = createEventInputSchema.extend({
  coverImageId: z.cuid().optional(),
  /** Set when the form was prefilled from a template (see the picker) */
  templateId: z.cuid2().optional(),
  /**
   * The prefilled cover comes from the template and is not an upload of the
   * submitter's own, so it travels as this flag instead of an upload id.
   */
  keepTemplateCover: z.boolean().optional(),
  /**
   * Publishes the new event to Discord right after creation. Absent means
   * "do not publish"; a template's preference reaches the action by
   * prefilling these fields, so clearing them in the form still wins.
   */
  ...discordPublishFieldsSchema.shape,
});

/**
 * Loads the template and everything that the new event copies from it.
 * Gives null when the template does not exist (anymore), is deleted or is
 * not visible to the user: it may have been deleted or unshared since the
 * form loaded, and the id itself is client input.
 */
const prepareTemplate = async (
  templateId: string,
  { copiesCover }: { readonly copiesCover: boolean },
): Promise<EventTemplateApplication | null> => {
  const templateContext = await getEventTemplateById(templateId);
  if (templateContext?.template.deletedAt !== null) return null;
  const { template } = templateContext;

  const templateContainer = toTemplateContainer(template.id);
  const [templatePositions, templateBriefing, templateCover] =
    await Promise.all([
      prisma.eventPosition.findMany({
        where: eventContainerColumns(templateContainer),
        orderBy: { order: "asc" },
        select: CLONABLE_POSITION_SELECT,
      }),
      getEventWikiContext(templateContainer),
      copiesCover && template.coverImageId
        ? prisma.upload.findUnique({
            where: { id: template.coverImageId },
            select: COPYABLE_UPLOAD_SELECT,
          })
        : Promise.resolve(null),
    ]);

  /**
   * Keyed on the root page, not on the context: a template whose root was
   * trashed has a context but nothing to copy.
   */
  const copiedRootPage = templateBriefing?.rootPage ?? null;

  return {
    id: template.id,
    name: template.name,
    copiesBriefing: copiedRootPage !== null,
    isBriefingPublished:
      copiedRootPage !== null &&
      copiedRootPage.eventReadScope !== WikiPageEventScope.MANAGERS &&
      copiedRootPage.eventReadScope !== WikiPageEventScope.INHERIT,
    copyCoverImage: async (transaction, citizenId) =>
      templateCover
        ? (await copyUpload(transaction, templateCover, citizenId)).id
        : null,
    copyContent: async (transaction, eventId, citizenId) => {
      const positionIdBySourceId = await clonePositions(
        transaction,
        buildPositionTree(templatePositions),
        {
          container: toEventContainer(eventId),
          parentPositionId: null,
          startOrder: 0,
        },
      );

      /**
       * Copied after the lineup, so the pages' POSITION scopes can be
       * remapped onto the event's own positions.
       */
      if (templateBriefing && copiedRootPage)
        await copyBriefingTree(transaction, {
          sourcePages: templateBriefing.pages,
          targetContainer: toEventContainer(eventId),
          createdByEntityId: citizenId,
          positionIdBySourceId,
        });
    },
  };
};

export const createEvent = createAuthenticatedAction(
  "createEvent",
  schema,
  async (formData, authentication, data, t) => {
    const {
      coverImageId,
      templateId,
      keepTemplateCover,
      discordPublishTarget,
      discordPublishChannelId,
      discordPublishLocation,
      ...input
    } = data;

    /**
     * Validate the request
     */
    const descriptionProblem = findDescriptionProblem(
      input.description ?? undefined,
    );
    if (descriptionProblem)
      return { error: descriptionProblem, requestPayload: formData };

    const template = templateId
      ? await prepareTemplate(templateId, {
          copiesCover: keepTemplateCover === true && !coverImageId,
        })
      : null;
    if (templateId && !template)
      return rejectConflict("Vorlage nicht gefunden", formData);

    /**
     * Create the event
     */
    let result;
    try {
      result = await createEventUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        input,
        { coverImageId, template: template ?? undefined },
      );
    } catch (error) {
      return mapEventErrorToActionResponse(error, formData, t);
    }
    const eventId = result.event.id;

    refresh();

    if (coverImageId) probeUploadImageDimensions(coverImageId);

    /**
     * Publish to Discord if the form (or the template it was prefilled from)
     * asked for it. A failure never undoes the created event — the manager
     * is told on the event page and can retry from its settings.
     */
    let publishFailed = false;
    if (discordPublishTarget) {
      const target = await resolveDiscordPublishTarget(
        {
          discordPublishTarget,
          discordPublishChannelId,
          discordPublishLocation,
        },
        eventId,
      );

      const publication = target
        ? await createDiscordEventPublication(eventId, target, {
            userId: authentication.session.user.id,
            citizenId: authentication.session.entity?.id ?? null,
          })
        : null;
      publishFailed = publication?.outcome !== DiscordSyncOutcome.Done;
    }

    /**
     * Redirect to the created event; the form's success hook closes the
     * modal while the navigation is in flight (see useAction).
     */
    const searchParams = new URLSearchParams();
    if (publishFailed) searchParams.set(DISCORD_PUBLISH_FAILED_PARAM, "1");
    if (!result.notifications_sent)
      searchParams.set(NOTIFICATIONS_FAILED_PARAM, "1");
    const query = searchParams.toString();
    redirect(
      query ? `${getEventPath(eventId)}?${query}` : getEventPath(eventId),
    );
  },
  {
    parseFormData: (formData) => ({
      ...parseEventDetailsFormData(formData),
      coverImageId: formData.get("coverImageId") || undefined,
      templateId: formData.get("templateId") || undefined,
      keepTemplateCover: formData.get("keepTemplateCover") === "1",
      ...parseDiscordPublishFields(formData),
    }),
  },
);
