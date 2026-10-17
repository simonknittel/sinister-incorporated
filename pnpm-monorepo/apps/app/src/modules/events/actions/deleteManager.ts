"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import {
  removeEventManager,
  removeEventManagerInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapEventErrorToActionResponse } from "../utils/eventActionErrors";

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
      return mapEventErrorToActionResponse(error, formData, t);
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
