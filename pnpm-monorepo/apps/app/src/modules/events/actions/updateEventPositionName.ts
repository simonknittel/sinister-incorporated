"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  renameLineupPosition,
  renameLineupPositionInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const updateEventPositionName = createAuthenticatedAction(
  "updateEventPositionName",
  renameLineupPositionInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await renameLineupPosition(
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
    };
  },
  {
    parseFormData: (formData) => ({
      position_id: formData.get("id"),
      name: formData.get("name"),
    }),
  },
);
