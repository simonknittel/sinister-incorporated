"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  transferEventTemplateOwnershipInputSchema,
  transferEventTemplateOwnership as transferEventTemplateOwnershipUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_TEMPLATE_ERROR_TEXTS } from "../utils/eventTemplateErrorTexts";

export const transferEventTemplateOwnership = createAuthenticatedAction(
  "transferEventTemplateOwnership",
  transferEventTemplateOwnershipInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await transferEventTemplateOwnershipUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: EVENT_TEMPLATE_ERROR_TEXTS,
      });
    }

    /**
     * Also without a change: possibly a different tab or user transferred
     * the template before, and the page must show it.
     */
    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    parseFormData: (formData) => ({
      template_id: formData.get("templateId"),
      new_owner_id: formData.get("newOwnerId"),
    }),
  },
);
