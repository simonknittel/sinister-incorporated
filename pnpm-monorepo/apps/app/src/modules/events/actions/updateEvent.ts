"use server";

import { prisma } from "@/db";
import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import {
  EventChange,
  EventVisibilityType,
  updateEventInputSchema,
  updateEvent as updateEventUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { findDescriptionProblem } from "../utils/discordEventDescription";
import {
  getDiscordSyncWarning,
  syncDiscordEventPublication,
} from "../utils/discordPublishing";
import { mapEventErrorToActionResponse } from "../utils/eventActionErrors";
import { parseEventDetailsFormData } from "../utils/eventFormData";

/** The changes that the Discord event shows */
const DISCORD_CONTENT_CHANGES: ReadonlySet<EventChange> = new Set([
  EventChange.Name,
  EventChange.Description,
  EventChange.Schedule,
]);

const isPublishedOnDiscord = async (eventId: string) =>
  (
    await prisma.event.findUnique({
      where: { id: eventId },
      select: { discordPublishedId: true },
    })
  )?.discordPublishedId != null;

export const updateEvent = createAuthenticatedAction(
  "updateEvent",
  updateEventInputSchema,
  async (formData, authentication, data, t) => {
    /**
     * A description stored before the limit became smaller reaches the
     * action untouched, thus the action names the field.
     */
    const descriptionProblem = findDescriptionProblem(
      data.description ?? undefined,
    );
    if (descriptionProblem)
      return { error: descriptionProblem, requestPayload: formData };

    let result;
    try {
      result = await updateEventUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
        { syncsDiscordPublication: true },
      );
    } catch (error) {
      return mapEventErrorToActionResponse(error, formData, t);
    }

    /**
     * Also without changes: possibly a different tab or manager saved the
     * same values before, and the page must show them.
     */
    refresh();

    /**
     * Carry the change over to Discord if the event is published there. A
     * no-op otherwise, and never able to undo the save above — a Discord
     * problem only comes back as a warning next to the success message.
     */
    const discordSyncWarning = result.changes.some((change) =>
      DISCORD_CONTENT_CHANGES.has(change),
    )
      ? getDiscordSyncWarning(await syncDiscordEventPublication(data.event_id))
      : null;

    /**
     * Narrowing a published event's visibility does not narrow it on
     * Discord — the guild keeps seeing it. Said out loud rather than
     * silently unpublishing, which would be a surprise of its own.
     */
    const becameRestrictedWhilePublished =
      result.changes.includes(EventChange.Visibility) &&
      result.event.visibility === EventVisibilityType.Restricted &&
      (await isPublishedOnDiscord(data.event_id));

    const warnings = [
      discordSyncWarning ??
        (becameRestrictedWhilePublished
          ? "Das Event bleibt auf Discord für alle Mitglieder des Servers sichtbar. Entferne es dort, wenn das nicht gewollt ist."
          : null),
      result.notifications_sent ? null : t("Common.notificationsFailed"),
    ].filter((warning) => warning !== null);

    /**
     * Respond with the result
     */
    return {
      success: t("Common.successfullySaved"),
      ...(warnings.length > 0 ? { warning: warnings.join(" ") } : {}),
    };
  },
  {
    parseFormData: (formData) => ({
      event_id: formData.get("eventId"),
      ...parseEventDetailsFormData(formData),
    }),
  },
);
