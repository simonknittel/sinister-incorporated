"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  createEventParticipation,
  eventParticipationInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

/** Refuses a second sign-up, for example from a different tab */
export const signUpForEvent = createAuthenticatedAction(
  "signUpForEvent",
  eventParticipationInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await createEventParticipation(
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
      success: "Du bist angemeldet.",
    };
  },
  {
    parseFormData: (formData) => ({
      event_id: formData.get("eventId"),
      comment: formData.get("comment") ?? undefined,
    }),
  },
);
