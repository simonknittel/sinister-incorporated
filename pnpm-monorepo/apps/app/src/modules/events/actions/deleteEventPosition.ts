"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  deleteEventPositionInputSchema,
  deleteLineupPosition,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

/** The lineup editor also deletes the positions of an event template */
export const deleteEventPosition = createAuthenticatedAction(
  "deleteEventPosition",
  deleteEventPositionInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await deleteLineupPosition(
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
    parseFormData: (formData) => ({ position_id: formData.get("id") }),
  },
);
