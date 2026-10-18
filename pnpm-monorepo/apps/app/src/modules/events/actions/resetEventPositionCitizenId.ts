"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  assignEventPosition,
  assignEventPositionInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { LINEUP_ERROR_TEXTS } from "../utils/lineupErrorTexts";

export const resetEventPositionCitizenId = createAuthenticatedAction(
  "resetEventPositionCitizenId",
  assignEventPositionInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await assignEventPosition(
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
      citizen_id: null,
    }),
  },
);
