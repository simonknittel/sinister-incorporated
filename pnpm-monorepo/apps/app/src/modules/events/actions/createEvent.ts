"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { probeUploadImageDimensions } from "@/modules/common/utils/probeUploadImageDimensions";
import { EVENT_TEMPLATE_ERROR_TEXTS } from "@/modules/event-templates/utils/eventTemplateErrorTexts";
import {
  createEventInputSchema,
  createEvent as createEventUseCase,
  DiscordSyncOutcome,
  idSchema,
  type CreateEventOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import {
  discordPublishFieldsSchema,
  parseDiscordPublishFields,
} from "../utils/discordPublishFields";
import {
  DISCORD_PUBLISH_FAILED_PARAM,
  getEventPath,
  NOTIFICATIONS_FAILED_PARAM,
} from "../utils/eventConstraints";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";
import { parseEventDetailsFormData } from "../utils/eventFormData";

/**
 * The use case takes the details. The cover image, the template and the
 * Discord publication are only in the app.
 */
const schema = createEventInputSchema.extend({
  coverImageId: idSchema.optional(),
  /** Set when the form was prefilled from a template (see the picker) */
  templateId: idSchema.optional(),
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

    let result: CreateEventOutput;
    try {
      result = await createEventUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        input,
        {
          coverImageId,
          template: templateId
            ? {
                templateId,
                copiesCover: keepTemplateCover === true && !coverImageId,
              }
            : undefined,
          discordPublication: discordPublishTarget
            ? {
                target: discordPublishTarget,
                channelId: discordPublishChannelId,
                location: discordPublishLocation,
              }
            : undefined,
        },
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: { ...EVENT_ERROR_TEXTS, ...EVENT_TEMPLATE_ERROR_TEXTS },
      });
    }
    const eventId = result.event.id;

    refresh();

    if (coverImageId) probeUploadImageDimensions(coverImageId);

    /**
     * Redirect to the created event; the form's success hook closes the
     * modal while the navigation is in flight (see useAction). A failed
     * publication never undoes the created event — the event page tells the
     * manager, who can retry from its settings.
     */
    const searchParams = new URLSearchParams();
    if (result.discord && result.discord.outcome !== DiscordSyncOutcome.Done)
      searchParams.set(DISCORD_PUBLISH_FAILED_PARAM, "1");
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
