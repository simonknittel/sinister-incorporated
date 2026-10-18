"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  removeEventManager,
  removeEventManagerInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const deleteManager = createAuthenticatedAction(
  "deleteManager",
  removeEventManagerInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await removeEventManager(
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
      success: t("Common.successfullyDeleted"),
    };
  },
  {
    parseFormData: (formData) => ({
      event_id: formData.get("eventId"),
      citizen_id: formData.get("managerId"),
    }),
  },
);
