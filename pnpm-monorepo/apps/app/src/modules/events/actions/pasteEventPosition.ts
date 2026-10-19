"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  pasteLineupPosition,
  pasteLineupPositionInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { LINEUP_ERROR_TEXTS } from "../utils/lineupErrorTexts";

export const pasteEventPosition = createAuthenticatedAction(
  "pasteEventPosition",
  pasteLineupPositionInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await pasteLineupPosition(
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
      source_position_id: formData.get("sourcePositionId"),
      target_position_id: formData.get("targetPositionId"),
      placement: formData.get("placement"),
    }),
  },
);
