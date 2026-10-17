"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import {
  addEventManagers,
  addEventManagersInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapEventErrorToActionResponse } from "../utils/eventActionErrors";

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
      return mapEventErrorToActionResponse(error, formData, t);
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
