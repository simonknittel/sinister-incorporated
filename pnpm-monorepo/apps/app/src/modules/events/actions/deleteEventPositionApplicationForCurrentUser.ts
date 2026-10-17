"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import {
  withdrawEventPositionApplication,
  withdrawEventPositionApplicationInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapLineupErrorToActionResponse } from "../utils/lineupErrorResponse";

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
        return mapLineupErrorToActionResponse(error, formData, t);
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
