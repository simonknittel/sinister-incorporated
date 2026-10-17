"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import {
  cancelEventParticipationInputSchema,
  cancelEventParticipation as cancelEventParticipationUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapEventErrorToActionResponse } from "../utils/eventActionErrors";

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
      return mapEventErrorToActionResponse(error, formData, t);
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
