"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  addEventManagers,
  addEventManagersInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const createManagers = createAuthenticatedAction(
  "createManagers",
  addEventManagersInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await addEventManagers(
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
      success: "Erfolgreich gespeichert.",
    };
  },
  {
    parseFormData: (formData) => ({
      event_id: formData.get("eventId"),
      citizen_ids: formData
        .getAll("managerId[]")
        .map((managerId) =>
          typeof managerId === "string" ? managerId.trim() : managerId,
        ),
    }),
  },
);
