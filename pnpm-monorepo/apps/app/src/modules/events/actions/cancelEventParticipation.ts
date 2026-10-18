"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  cancelEventParticipationInputSchema,
  cancelEventParticipation as cancelEventParticipationUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const cancelEventParticipation = createAuthenticatedAction(
  "cancelEventParticipation",
  cancelEventParticipationInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await cancelEventParticipationUseCase(
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

    refresh();

    return {
      success: "Du hast dich abgemeldet.",
    };
  },
  {
    parseFormData: (formData) => ({ event_id: formData.get("eventId") }),
  },
);
