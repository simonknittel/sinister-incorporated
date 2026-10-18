"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateRolePermissionsInputSchema,
  updateRolePermissions as updateRolePermissionsUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { ROLE_ERROR_TEXTS } from "../utils/roleErrorTexts";

export const updateRolePermissions = createAuthenticatedAction(
  "updateRolePermissions",
  updateRolePermissionsInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateRolePermissionsUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: ROLE_ERROR_TEXTS,
      });
    }

    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    /** Each ticked checkbox sends its permission string as the field name */
    parseFormData: (formData) => ({
      role_id: formData.get("id"),
      permission_strings: Array.from(formData.keys()).filter(
        (key) => key !== "id" && !key.startsWith("$ACTION"),
      ),
    }),
  },
);
