"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateEvent,
  updateEventInputSchema,
  type UpdateEventOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const updateEventLineupEnabled = createAuthenticatedAction(
  "updateEventLineupEnabled",
  updateEventInputSchema,
  async (formData, authentication, data, t) => {
    let result: UpdateEventOutput;
    try {
      result = await updateEvent(
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
      success: t("Common.successfullySaved"),
      ...(result.notifications_sent
        ? {}
        : { warning: t("Common.notificationsFailed") }),
    };
  },
  {
    parseFormData: (formData) => ({
      event_id: formData.get("eventId"),
      // The checkbox sends a value only while it is checked
      lineup_enabled: Boolean(formData.get("value")),
    }),
  },
);
