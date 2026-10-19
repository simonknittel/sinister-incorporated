"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateNotificationSettings,
  updateNotificationSettingsInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";

export const updateMyNotificationSettings = createAuthenticatedAction(
  "updateMyNotificationSettings",
  updateNotificationSettingsInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateNotificationSettings(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    refresh();

    return {
      success: t("Common.successfullySaved"),
    };
  },
  {
    // The form sends one input for each setting that is switched on
    parseFormData: (formData) => ({
      enabled_input_names: [...new Set(formData.keys())],
    }),
  },
);
