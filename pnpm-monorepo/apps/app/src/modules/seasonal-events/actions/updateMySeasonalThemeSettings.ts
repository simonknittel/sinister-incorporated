"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateSeasonalThemeSettingsInputSchema,
  updateSeasonalThemeSettings as updateSeasonalThemeSettingsUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";

export const updateMySeasonalThemeSettings = createAuthenticatedAction(
  "updateMySeasonalThemeSettings",
  updateSeasonalThemeSettingsInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateSeasonalThemeSettingsUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    /**
     * A checked switch sends the key of its event; a cleared switch sends
     * nothing. The schema refuses a key that names no event of the calendar.
     */
    parseFormData: (formData) => ({
      enabled_event_keys: [...new Set(formData.keys())],
    }),
  },
);
