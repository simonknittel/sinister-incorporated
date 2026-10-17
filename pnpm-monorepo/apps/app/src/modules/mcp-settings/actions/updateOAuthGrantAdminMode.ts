"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { isAdminModeActive } from "@/modules/auth/utils/isAdminModeActive";
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
    // Like the switch on the page: only while the admin mode of the toolbar
    // is active, which is never the case while an admin assumes a user
    if (!(await isAdminModeActive(authentication.session)))
      return { error: t("Common.forbidden"), requestPayload: formData };

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
      grant_id: formData.get("grantId"),
      enabled: z.stringbool().parse(formData.get("enabled")),
    }),
  },
);
