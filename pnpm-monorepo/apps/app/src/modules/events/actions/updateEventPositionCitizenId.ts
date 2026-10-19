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
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

/** `resetEventPositionCitizenId` removes the citizen */
const schema = assignEventPositionInputSchema.extend({
  citizen_id: assignEventPositionInputSchema.shape.citizen_id.unwrap(),
});

export const updateEventPositionCitizenId = createAuthenticatedAction(
  "updateEventPositionCitizenId",
  schema,
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
      position_id: formData.get("positionId"),
      citizen_id: formData.get("citizenId"),
    }),
  },
);
