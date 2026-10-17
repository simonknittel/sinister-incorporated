"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  setOwnGrantAdminMode,
  setOwnGrantAdminModeInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import * as z from "zod";

/** The use case checks that the user is an admin */
export const updateOAuthGrantAdminMode = createAuthenticatedAction(
  "updateOAuthGrantAdminMode",
  setOwnGrantAdminModeInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await setOwnGrantAdminMode(
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
    parseFormData: (formData) => ({
      grantId: formData.get("grantId"),
      enabled: z.stringbool().parse(formData.get("enabled")),
    }),
  },
);
