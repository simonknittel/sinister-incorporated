"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  deleteCitizenLogInputSchema,
  deleteCitizenLog as deleteCitizenLogUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { CITIZEN_ERROR_TEXTS } from "../utils/citizenErrorTexts";

/** The logs of a deleted citizen are read only */
export const deleteCitizenLog = createAuthenticatedAction(
  "deleteCitizenLog",
  deleteCitizenLogInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await deleteCitizenLogUseCase(
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
      success: t("Common.successfullyDeleted"),
    };
  },
  { parseFormData: (formData) => ({ log_id: formData.get("id") }) },
);
