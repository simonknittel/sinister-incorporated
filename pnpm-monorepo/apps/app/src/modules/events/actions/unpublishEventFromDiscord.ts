"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  DiscordSyncOutcome,
  unpublishEventFromDiscordInputSchema,
  unpublishEventFromDiscord as unpublishEventFromDiscordUseCase,
  type DiscordSyncResult,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const unpublishEventFromDiscord = createAuthenticatedAction(
  "unpublishEventFromDiscord",
  unpublishEventFromDiscordInputSchema,
  async (formData, authentication, data, t) => {
    let result: DiscordSyncResult;
    try {
      result = await unpublishEventFromDiscordUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: EVENT_ERROR_TEXTS,
      });
    }

    if (result.outcome === DiscordSyncOutcome.Failed)
      return {
        error:
          "Discord konnte nicht erreicht werden. Das Event bleibt dort vorerst veröffentlicht.",
        requestPayload: formData,
      };

    refresh();

    return {
      success:
        result.outcome === DiscordSyncOutcome.Cleared
          ? "Das Event war auf Discord bereits gelöscht und gilt hier wieder als nicht veröffentlicht."
          : "Das Event wurde von Discord entfernt.",
    };
  },
  {
    parseFormData: (formData) => ({ event_id: formData.get("eventId") }),
  },
);
