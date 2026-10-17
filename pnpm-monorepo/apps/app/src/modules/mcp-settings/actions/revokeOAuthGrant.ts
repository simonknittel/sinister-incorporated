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
    // Only the user manages the own clients, not an admin who assumes the user
    if (authentication.session.assumedByAdminId)
      return { error: t("Common.forbidden"), requestPayload: formData };

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
);
