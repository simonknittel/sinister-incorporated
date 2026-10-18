"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateHumanResourcesRolesInputSchema,
  updateHumanResourcesRoles as updateHumanResourcesRolesUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { getIamErrorTexts } from "../utils/iamErrorTexts";

/** Replaces the whole list of the roles that count as Human Resources */
export const updateHumanResourcesRoles = createAuthenticatedAction(
  "updateHumanResourcesRoles",
  updateHumanResourcesRolesInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateHumanResourcesRolesUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: getIamErrorTexts(t),
      });
    }

    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    // One `roleId` form field per role
    parseFormData: (formData) => ({ role_ids: formData.getAll("roleId") }),
  },
);
