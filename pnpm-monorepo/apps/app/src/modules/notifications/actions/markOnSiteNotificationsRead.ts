"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  markOnSiteNotificationsReadInputSchema,
  markOnSiteNotificationsRead as markOnSiteNotificationsReadUseCase,
} from "@sam-monorepo/application";

export const markOnSiteNotificationsRead = createAuthenticatedAction(
  "markOnSiteNotificationsRead",
  markOnSiteNotificationsReadInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await markOnSiteNotificationsReadUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    return { success: "Als gelesen markiert" };
  },
  {
    parseFormData: (formData) => ({
      notification_ids: formData.getAll("notificationId"),
    }),
  },
);
