"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { getRoleErrorTexts } from "@/modules/roles/utils/roleErrorTexts";
import {
  updateRoleAssignmentsInputSchema,
  updateRoleAssignments as updateRoleAssignmentsUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";

/** A ticked role checkbox sends a field with this prefix and the role id */
const ROLE_FIELD_PREFIX = "role_";

export const updateRoleAssignments = createAuthenticatedAction(
  "updateRoleAssignments",
  updateRoleAssignmentsInputSchema,
  async (formData, authentication, data, t) => {
    let result;
    try {
      result = await updateRoleAssignmentsUseCase(
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

    return {
      success: t("Common.successfullySaved"),
      ...(result.notifications_sent
        ? {}
        : { warning: t("Common.notificationsFailed") }),
    };
  },
  {
    parseFormData: (formData) => ({
      citizen_id: formData.get("citizenId"),
      role_ids: Array.from(formData.keys())
        .filter((key) => key.startsWith(ROLE_FIELD_PREFIX))
        .map((key) => key.slice(ROLE_FIELD_PREFIX.length)),
    }),
  },
);
