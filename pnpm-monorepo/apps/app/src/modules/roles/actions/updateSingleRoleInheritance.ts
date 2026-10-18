"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  setRoleInheritance,
  setRoleInheritanceInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import * as z from "zod";
import { ROLE_ERROR_TEXTS } from "../utils/roleErrorTexts";

/** The checkbox of the matrix sends its state as text */
const schema = setRoleInheritanceInputSchema.extend({
  enabled: z.stringbool(),
});

export const updateSingleRoleInheritance = createAuthenticatedAction(
  "updateSingleRoleInheritance",
  schema,
  async (formData, authentication, data, t) => {
    try {
      await setRoleInheritance(
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
    parseFormData: (formData) => ({
      role_id: formData.get("roleId"),
      inherited_role_id: formData.get("inheritedRoleId"),
      enabled: formData.get("checked"),
    }),
  },
);
