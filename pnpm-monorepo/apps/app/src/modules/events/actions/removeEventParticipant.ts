"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import {
  removeEventParticipantInputSchema,
  removeEventParticipant as removeEventParticipantUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapEventErrorToActionResponse } from "../utils/eventActionErrors";

export const removeEventParticipant = createAuthenticatedAction(
  "removeEventParticipant",
  removeEventParticipantInputSchema,
  async (formData, authentication, data, t) => {
    let result;
    try {
      result = await removeEventParticipantUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapEventErrorToActionResponse(error, formData, t);
    }

    refresh();

    return {
      success: "Teilnehmer entfernt.",
      ...(result.notifications_sent
        ? {}
        : { warning: t("Common.notificationsFailed") }),
    };
  },
  {
    parseFormData: (formData) => ({
      event_id: formData.get("eventId"),
      citizen_id: formData.get("citizenId"),
      reason: formData.get("reason") ?? undefined,
    }),
  },
);
