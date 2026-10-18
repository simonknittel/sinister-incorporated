"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  banUserInputSchema,
  banUser as banUserUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { USER_ERROR_TEXTS } from "../utils/userErrorTexts";

export const banUserAction = createAuthenticatedAction(
  "banUser",
  banUserInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await banUserUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: USER_ERROR_TEXTS,
      });
    }

    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    parseFormData: (formData) => ({
      user_id: formData.get("userId"),
      reason: formData.get("reason") ?? undefined,
    }),
  },
);
