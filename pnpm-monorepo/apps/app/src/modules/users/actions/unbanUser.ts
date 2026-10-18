"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  unbanUserInputSchema,
  unbanUser as unbanUserUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { USER_ERROR_TEXTS } from "../utils/userErrorTexts";

export const unbanUserAction = createAuthenticatedAction(
  "unbanUser",
  unbanUserInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await unbanUserUseCase(
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
    parseFormData: (formData) => ({ user_id: formData.get("userId") }),
  },
);
