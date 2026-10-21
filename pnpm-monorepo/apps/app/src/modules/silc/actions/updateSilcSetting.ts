"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateSilcSettingInputSchema,
  updateSilcSetting as updateSilcSettingUseCase,
} from "@sam-monorepo/application";

export const updateSilcSetting = createUseCaseAction({
  name: "updateSilcSetting",
  schema: updateSilcSettingInputSchema,
  useCase: updateSilcSettingUseCase,
  success: (t) => t("Common.successfullySaved"),
});
