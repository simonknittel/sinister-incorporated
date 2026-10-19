"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  publishEventToDiscordInputSchema,
  publishEventToDiscord as publishEventToDiscordUseCase,
  type DiscordSyncResult,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { parseDiscordPublishFields } from "../utils/discordPublishFields";
import {
  getDiscordCoverImageWarning,
  getDiscordPublishError,
} from "../utils/discordPublishing";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const publishEventToDiscord = createAuthenticatedAction(
  "publishEventToDiscord",
  publishEventToDiscordInputSchema,
  async (formData, authentication, data, t) => {
    let result: DiscordSyncResult;
    try {
      result = await publishEventToDiscordUseCase(
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

    /**
     * Nothing was saved, thus the page stays as it is
     */
    const error = getDiscordPublishError(result);
    if (error) return { error, requestPayload: formData };

    refresh();

    const coverImageWarning = getDiscordCoverImageWarning(result);

    return {
      success: "Das Event wurde auf Discord veröffentlicht.",
      ...(coverImageWarning ? { warning: coverImageWarning } : {}),
    };
  },
  {
    parseFormData: (formData) => ({
      event_id: formData.get("eventId"),
      ...parseDiscordPublishFields(formData),
    }),
  },
);
