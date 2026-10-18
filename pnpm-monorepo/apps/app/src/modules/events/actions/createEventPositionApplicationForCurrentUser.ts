"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  applyForEventPosition,
  applyForEventPositionInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { LINEUP_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const createEventPositionApplicationForCurrentUser =
  createAuthenticatedAction(
    "createEventPositionApplicationForCurrentUser",
    applyForEventPositionInputSchema,
    async (formData, authentication, data, t) => {
      try {
        await applyForEventPosition(
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
        success:
          "Erfolgreich gespeichert. Die Anmeldung muss vom Organisator des Events bestätigt werden.",
      };
    },
    {
      parseFormData: (formData) => ({
        position_id: formData.get("positionId"),
      }),
    },
  );
