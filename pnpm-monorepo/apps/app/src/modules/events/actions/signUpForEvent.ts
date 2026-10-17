"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import {
  createEventParticipation,
  eventParticipationInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapEventErrorToActionResponse } from "../utils/eventActionErrors";

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
      return mapEventErrorToActionResponse(error, formData, t);
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
