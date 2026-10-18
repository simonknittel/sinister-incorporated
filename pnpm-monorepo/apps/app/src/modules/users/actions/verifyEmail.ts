"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { verifyEmail, verifyEmailInputSchema } from "@sam-monorepo/application";
import { refresh } from "next/cache";

export const verifyEmailAction = createAuthenticatedAction(
  "verifyEmail",
  verifyEmailInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await verifyEmail(
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
    parseFormData: (formData) => ({
      user_id: formData.get("userId"),
    }),
  },
);
