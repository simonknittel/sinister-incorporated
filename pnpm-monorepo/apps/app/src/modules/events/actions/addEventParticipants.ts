"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  addEventParticipantsInputSchema,
  addEventParticipants as addEventParticipantsUseCase,
  type AddEventParticipantsOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const addEventParticipants = createAuthenticatedAction(
  "addEventParticipants",
  addEventParticipantsInputSchema,
  async (formData, authentication, data, t) => {
    let result: AddEventParticipantsOutput;
    try {
      result = await addEventParticipantsUseCase(
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
     * Also when nobody was added: then the citizens signed up in the
     * meantime, and the page must show it.
     */
    refresh();

    if (result.added_citizen_ids.length <= 0)
      return { success: "Alle ausgewählten Citizen sind bereits angemeldet." };

    return {
      success: `${result.added_citizen_ids.length} Teilnehmer hinzugefügt.`,
      ...(result.notifications_sent
        ? {}
        : { warning: t("Common.notificationsFailed") }),
    };
  },
  {
    parseFormData: (formData) => ({
      event_id: formData.get("eventId"),
      citizen_ids: formData.getAll("citizenId[]"),
      comment: formData.get("comment") ?? undefined,
    }),
  },
);
