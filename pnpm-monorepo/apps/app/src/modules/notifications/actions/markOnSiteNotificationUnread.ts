"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  markOnSiteNotificationUnreadInputSchema,
  markOnSiteNotificationUnread as markOnSiteNotificationUnreadUseCase,
} from "@sam-monorepo/application";

export const markOnSiteNotificationUnread = createAuthenticatedAction(
  "markOnSiteNotificationUnread",
  markOnSiteNotificationUnreadInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await markOnSiteNotificationUnreadUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    return { success: "Als ungelesen markiert" };
  },
  {
    parseFormData: (formData) => ({
      notification_id: formData.get("notificationId"),
    }),
  },
);
