"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateNotificationSettings,
  updateNotificationSettingsInputSchema,
} from "@sam-monorepo/application";

export const updateMyNotificationSettings = createUseCaseAction({
  name: "updateMyNotificationSettings",
  schema: updateNotificationSettingsInputSchema,
  useCase: updateNotificationSettings,
  // The form sends one input for each setting that is switched on
  parseFormData: (formData) => ({
    enabled_input_names: [...new Set(formData.keys())],
  }),
  success: (t) => t("Common.successfullySaved"),
});
