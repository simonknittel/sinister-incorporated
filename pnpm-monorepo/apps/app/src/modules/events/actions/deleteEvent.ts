"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import { log } from "@/modules/logging";
import {
  deleteEventInputSchema,
  deleteEvent as deleteEventUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import {
  DiscordSyncOutcome,
  removeDiscordEventPublication,
} from "../utils/discordPublishing";
import { mapEventErrorToActionResponse } from "../utils/eventActionErrors";

export const deleteEvent = createAuthenticatedAction(
  "deleteEvent",
  deleteEventInputSchema,
  async (formData, authentication, data, t) => {
    let result;
    try {
      result = await deleteEventUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
        { removesDiscordPublication: true },
      );
    } catch (error) {
      return mapEventErrorToActionResponse(error, formData, t);
    }

    refresh();

    /**
     * Take the event off Discord: the deleted event is not shown anywhere
     * in the app, thus the manager cannot do it later from the app. A failure
     * cannot undo the deletion — hence the catch — and comes back as a
     * warning, so that the manager deletes the Discord event by hand.
     */
    const discordResult = await removeDiscordEventPublication(result.event_id, {
      userId: authentication.session.user.id,
      citizenId: authentication.session.entity?.id ?? null,
    }).catch((error: unknown) => {
      log.error("Failed to remove a deleted event from Discord", {
        eventId: result.event_id,
        error,
      });
      return { outcome: DiscordSyncOutcome.Failed } as const;
    });

    /**
     * Respond with the result
     */
    const warnings = [
      discordResult.outcome === DiscordSyncOutcome.Failed
        ? "Das Event konnte nicht von Discord entfernt werden und muss dort von Hand gelöscht werden."
        : null,
      result.notifications_sent ? null : t("Common.notificationsFailed"),
    ].filter((warning) => warning !== null);

    return {
      success: "Das Event wurde gelöscht.",
      ...(warnings.length > 0 ? { warning: warnings.join(" ") } : {}),
    };
  },
  {
    parseFormData: (formData) => ({ event_id: formData.get("eventId") }),
  },
);
