"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  revokeOwnGrant,
  revokeOwnGrantInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";

export const revokeOAuthGrant = createAuthenticatedAction(
  "revokeOAuthGrant",
  revokeOwnGrantInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await revokeOwnGrant(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    refresh();

    return { success: t("Common.successfullyDeleted") };
  },
  {
    parseFormData: (formData) => ({ grant_id: formData.get("grantId") }),
  },
);
