"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateNoteInputSchema,
  updateNote as updateNoteUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { CITIZEN_ERROR_TEXTS } from "../utils/citizenErrorTexts";

/**
 * Moves a note to a different note type or classification level. The notes
 * of a deleted citizen are read only.
 */
export const updateNote = createAuthenticatedAction(
  "updateNote",
  updateNoteInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateNoteUseCase(
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
      note_type_id: formData.get("noteTypeId"),
      classification_level_id: formData.get("classificationLevelId"),
    }),
  },
);
