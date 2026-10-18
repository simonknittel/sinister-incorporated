"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  createCitizenLogInputSchema,
  createCitizenLog as createCitizenLogUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { CITIZEN_ERROR_TEXTS } from "../utils/citizenErrorTexts";

export const createCitizenLog = createAuthenticatedAction(
  "createCitizenLog",
  createCitizenLogInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await createCitizenLogUseCase(
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
    /** The fields of a note are absent for an identity log */
    parseFormData: (formData) => ({
      citizen_id: formData.get("citizenId"),
      type: formData.get("type"),
      content: formData.get("content"),
      note_type_id: formData.get("noteTypeId"),
      classification_level_id: formData.get("classificationLevelId"),
    }),
  },
);
