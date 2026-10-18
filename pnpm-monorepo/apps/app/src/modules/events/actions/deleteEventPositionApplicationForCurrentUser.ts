"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  withdrawEventPositionApplication,
  withdrawEventPositionApplicationInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { LINEUP_ERROR_TEXTS } from "../utils/lineupErrorTexts";

export const deleteEventPositionApplicationForCurrentUser =
  createAuthenticatedAction(
    "deleteEventPositionApplicationForCurrentUser",
    withdrawEventPositionApplicationInputSchema,
    async (formData, authentication, data, t) => {
      try {
        await withdrawEventPositionApplication(
          getApplicationContext(),
          await toActor(authentication.session),
          data,
        );
      } catch (error) {
        return mapApplicationErrorToActionResponse(error, {
          formData,
          t,
          texts: LINEUP_ERROR_TEXTS,
        });
      }

      refresh();

      return {
        success: t("Common.successfullySaved"),
      };
    },
    {
      parseFormData: (formData) => ({
        position_id: formData.get("positionId"),
      }),
    },
  );
