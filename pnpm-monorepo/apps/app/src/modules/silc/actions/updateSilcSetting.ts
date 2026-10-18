"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateSilcSettingInputSchema,
  updateSilcSetting as updateSilcSettingUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";

export const updateSilcSetting = createAuthenticatedAction(
  "updateSilcSetting",
  updateSilcSettingInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateSilcSettingUseCase(
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
);
