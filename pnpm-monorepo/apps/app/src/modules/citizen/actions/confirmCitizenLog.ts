"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  confirmCitizenLogInputSchema,
  confirmCitizenLog as confirmCitizenLogUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { CITIZEN_ERROR_TEXTS } from "../utils/citizenErrorTexts";

/**
 * Confirms a log or marks it as a false report. The logs of a deleted
 * citizen are read only.
 */
export const confirmCitizenLog = createAuthenticatedAction(
  "confirmCitizenLog",
  confirmCitizenLogInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await confirmCitizenLogUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: CITIZEN_ERROR_TEXTS,
      });
    }

    refresh();

    return {
      success: t("Common.successfullySaved"),
    };
  },
  {
    parseFormData: (formData) => ({
      log_id: formData.get("id"),
      confirmed: formData.get("confirmed"),
    }),
  },
);
