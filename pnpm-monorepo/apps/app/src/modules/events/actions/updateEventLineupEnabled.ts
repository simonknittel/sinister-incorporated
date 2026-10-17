"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import { updateEvent, updateEventInputSchema } from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapEventErrorToActionResponse } from "../utils/eventActionErrors";

export const updateEventLineupEnabled = createAuthenticatedAction(
  "updateEventLineupEnabled",
  updateEventInputSchema,
  async (formData, authentication, data, t) => {
    let result;
    try {
      result = await updateEvent(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapEventErrorToActionResponse(error, formData, t);
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
