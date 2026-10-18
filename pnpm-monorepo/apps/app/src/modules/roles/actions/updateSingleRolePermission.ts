"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  setRolePermission,
  setRolePermissionInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import * as z from "zod";
import { getRoleErrorTexts } from "../utils/roleErrorTexts";

/** The checkbox of the matrix sends its state as text */
const schema = setRolePermissionInputSchema.extend({
  enabled: z.stringbool(),
});

export const updateSingleRolePermission = createAuthenticatedAction(
  "updateSingleRolePermission",
  schema,
  async (formData, authentication, data, t) => {
    try {
      await setRolePermission(
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
      role_id: formData.get("roleId"),
      permission_string: formData.get("permissionString"),
      enabled: formData.get("checked"),
    }),
  },
);
