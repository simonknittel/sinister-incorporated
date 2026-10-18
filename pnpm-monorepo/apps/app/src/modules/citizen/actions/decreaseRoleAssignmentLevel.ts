"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { getRoleErrorTexts } from "@/modules/roles/utils/roleErrorTexts";
import {
  changeRoleAssignmentLevelInputSchema,
  decreaseRoleAssignmentLevel as decreaseRoleAssignmentLevelUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";

export const decreaseRoleAssignmentLevel = createAuthenticatedAction(
  "decreaseRoleAssignmentLevel",
  changeRoleAssignmentLevelInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await decreaseRoleAssignmentLevelUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: getRoleErrorTexts(t),
      });
    }

    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    parseFormData: (formData) => ({
      citizen_id: formData.get("citizenId"),
      role_id: formData.get("roleId"),
    }),
  },
);
