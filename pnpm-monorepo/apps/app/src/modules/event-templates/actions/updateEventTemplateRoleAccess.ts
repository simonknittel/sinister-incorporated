"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateEventTemplateRoleAccessInputSchema,
  updateEventTemplateRoleAccess as updateEventTemplateRoleAccessUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_TEMPLATE_ERROR_TEXTS } from "../utils/eventTemplateErrorTexts";

export const updateEventTemplateRoleAccess = createAuthenticatedAction(
  "updateEventTemplateRoleAccess",
  updateEventTemplateRoleAccessInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateEventTemplateRoleAccessUseCase(
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

    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    parseFormData: (formData) => ({
      template_id: formData.get("templateId"),
      read_role_ids: formData.getAll("readRoleId[]"),
      edit_role_ids: formData.getAll("editRoleId[]"),
    }),
  },
);
