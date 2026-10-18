"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { getRoleAssignmentErrorTexts } from "@/modules/roles/utils/roleErrorTexts";
import {
  deleteRoleAssignmentInputSchema,
  deleteRoleAssignment as deleteRoleAssignmentUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";

export const deleteRoleAssignment = createAuthenticatedAction(
  "deleteRoleAssignment",
  deleteRoleAssignmentInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await deleteRoleAssignmentUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: getRoleAssignmentErrorTexts(t),
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
