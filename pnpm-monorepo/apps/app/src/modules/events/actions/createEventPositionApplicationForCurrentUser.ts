"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import {
  applyForEventPosition,
  applyForEventPositionInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapLineupErrorToActionResponse } from "../utils/lineupErrorResponse";

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
        return mapLineupErrorToActionResponse(error, formData, t);
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
