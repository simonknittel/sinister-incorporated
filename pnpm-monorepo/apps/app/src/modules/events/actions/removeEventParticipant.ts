"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  removeEventParticipantInputSchema,
  removeEventParticipant as removeEventParticipantUseCase,
  type RemoveEventParticipantOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const removeEventParticipant = createAuthenticatedAction(
  "removeEventParticipant",
  removeEventParticipantInputSchema,
  async (formData, authentication, data, t) => {
    let result: RemoveEventParticipantOutput;
    try {
      result = await removeEventParticipantUseCase(
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
