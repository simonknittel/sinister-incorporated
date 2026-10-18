"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  deleteCitizenInputSchema,
  deleteCitizen as deleteCitizenUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { CITIZEN_ERROR_TEXTS } from "../utils/citizenErrorTexts";

export const deleteCitizen = createAuthenticatedAction(
  "deleteCitizen",
  deleteCitizenInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await deleteCitizenUseCase(
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
  { parseFormData: (formData) => ({ citizen_id: formData.get("id") }) },
);
